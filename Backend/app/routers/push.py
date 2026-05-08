from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Router, Route
from ..database import SessionLocal, PushSubscription, Reminder
from .auth import require_auth
import os
import json
from datetime import datetime
from pywebpush import webpush, WebPushException
import asyncio

async def get_vapid_public_key(request: Request):
    public_key = os.getenv("VAPID_PUBLIC_KEY")
    if not public_key:
        return JSONResponse({"error": "VAPID not configured"}, status_code=500)
    return JSONResponse({"public_key": public_key})

async def subscribe(request: Request):
    auth = await require_auth(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        body = await request.json()
        subscription = body.get("subscription")
        if not subscription or not subscription.get("endpoint"):
            return JSONResponse({"success": False, "error": "Invalid subscription"}, status_code=400)
        keys = subscription.get("keys", {})
        db = SessionLocal()
        try:
            existing = db.query(PushSubscription).filter_by(endpoint=subscription["endpoint"]).first()
            if existing:
                existing.p256dh = keys.get("p256dh")
                existing.auth = keys.get("auth")
                existing.user_id = auth["user_id"]
            else:
                sub = PushSubscription(
                    user_id=auth["user_id"],
                    endpoint=subscription["endpoint"],
                    p256dh=keys.get("p256dh"),
                    auth=keys.get("auth")
                )
                db.add(sub)
            db.commit()
            return JSONResponse({"success": True})
        finally:
            db.close()
    except Exception:
        return JSONResponse({"success": False, "error": "Subscription failed"}, status_code=400)

async def unsubscribe(request: Request):
    auth = await require_auth(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        body = await request.json()
        endpoint = body.get("endpoint")
        if not endpoint:
            return JSONResponse({"success": False, "error": "Endpoint required"}, status_code=400)
        db = SessionLocal()
        try:
            db.query(PushSubscription).filter_by(endpoint=endpoint, user_id=auth["user_id"]).delete()
            db.commit()
            return JSONResponse({"success": True})
        finally:
            db.close()
    except Exception:
        return JSONResponse({"success": False}, status_code=400)

def is_reminder_due(reminder, now):
    if reminder.completed or getattr(reminder, 'notified', False):
        return False
    try:
        due_date = datetime.strptime(reminder.date, "%Y-%m-%d").date() if reminder.date else now.date()
        if reminder.time and len(reminder.time) == 5:
            due_str = f"{reminder.date or now.strftime('%Y-%m-%d')} {reminder.time}"
            due_dt = datetime.strptime(due_str, "%Y-%m-%d %H:%M")
            return due_dt <= now
        due_dt = datetime.combine(due_date, datetime.min.time())
        return due_dt <= now
    except Exception:
        return False

async def send_push_notification(subscription, payload):
    subscription_info = {
        "endpoint": subscription.endpoint,
        "keys": {"p256dh": subscription.p256dh, "auth": subscription.auth}
    }
    vapid_private_key = os.getenv("VAPID_PRIVATE_KEY")
    vapid_claim_sub = os.getenv("VAPID_CLAIM_SUB", "mailto:dev@remindarin.com")
    if not vapid_private_key:
        return False
    try:
        await asyncio.to_thread(
            webpush,
            subscription_info=subscription_info,
            data=json.dumps(payload),
            vapid_private_key=vapid_private_key,
            vapid_claims={"sub": vapid_claim_sub},
            ttl=86400
        )
        return True
    except WebPushException as ex:
        if ex.response and ex.response.status_code == 410:
            db = SessionLocal()
            try:
                db.query(PushSubscription).filter_by(id=subscription.id).delete()
                db.commit()
            finally:
                db.close()
        return False
    except Exception:
        return False

async def process_due_reminders():
    db = SessionLocal()
    try:
        now = datetime.now()
        reminders = db.query(Reminder).filter(
            Reminder.completed == False,
            Reminder.notified == False
        ).all()
        sent_count = 0
        for reminder in reminders:
            if is_reminder_due(reminder, now):
                subs = db.query(PushSubscription).filter_by(user_id=reminder.user_id).all()
                payload = {
                    "title": "🔔 Remindarin Reminder",
                    "body": reminder.text,
                    "icon": "/icons/icon-192x192.png",
                    "badge": "/icons/badge.png",
                    "data": {
                        "type": "reminder",
                        "reminder_id": reminder.id,
                        "text": reminder.text,
                        "time": reminder.time,
                        "date": reminder.date
                    }
                }
                for sub in subs:
                    if await send_push_notification(sub, payload):
                        sent_count += 1
                reminder.notified = True
                db.commit()
        return sent_count
    finally:
        db.close()

async def send_due_notifications(request: Request):
    cron_secret = request.headers.get("X-Cron-Secret")
    if cron_secret != os.getenv("CRON_SECRET"):
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    count = await process_due_reminders()
    return JSONResponse({"success": True, "notifications_sent": count})

push_router = Router([
    Route("/vapid-public-key", get_vapid_public_key, methods=["GET"]),
    Route("/subscribe", subscribe, methods=["POST"]),
    Route("/unsubscribe", unsubscribe, methods=["POST"]),
    Route("/send-due", send_due_notifications, methods=["POST"]),
])