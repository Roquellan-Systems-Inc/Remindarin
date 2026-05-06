from starlette.routing import Router, Route
from starlette.responses import JSONResponse, RedirectResponse
from starlette.requests import Request
from ..database import SessionLocal, User, VerificationCode
from datetime import datetime, timedelta
import random
import os
import httpx

router = Router()

rate_limit = {}

async def signup(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)

    email = body.get("email", "").strip().lower()
    if not email or "@" not in email:
        return JSONResponse({"error": "Valid email required"}, status_code=400)

    db = SessionLocal()
    try:
        # Create or get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(email=email, is_verified=False)
            db.add(user)
            db.commit()
            db.refresh(user)

        # Generate 6-digit code
        code = f"{random.randint(100000, 999999)}"
        expires = datetime.utcnow() + timedelta(minutes=10)

        # Delete old codes
        db.query(VerificationCode).filter(VerificationCode.email == email).delete()

        # Save new code
        verification = VerificationCode(email=email, code=code, expires_at=expires)
        db.add(verification)
        db.commit()

        print(f"\n🔐 VERIFICATION CODE FOR {email}: {code}\n")

        return JSONResponse({
            "success": True,
            "message": "Verification code sent to your email",
            "email": email
        })
    finally:
        db.close()

async def verify_code(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)

    email = body.get("email", "").strip().lower()
    code = body.get("code", "").strip()

    db = SessionLocal()
    try:
        verification = db.query(VerificationCode).filter(
            VerificationCode.email == email,
            VerificationCode.code == code,
            VerificationCode.expires_at > datetime.utcnow()
        ).first()

        if not verification:
            return JSONResponse({"error": "Invalid or expired code"}, status_code=400)

        # Mark user as verified
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.is_verified = True
            db.commit()

        # Delete used code
        db.query(VerificationCode).filter(VerificationCode.email == email).delete()
        db.commit()

        return JSONResponse({
            "success": True,
            "message": "Email verified successfully",
            "user": {"id": user.id, "email": user.email}
        })
    finally:
        db.close()

async def google_auth(request: Request):
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    callback_url = os.getenv("GOOGLE_CALLBACK_URL", "https://remindarin.onrender.com/api/v1/auth/google/callback")
    
    if not google_client_id:
        return JSONResponse({"error": "Google OAuth not configured"}, status_code=500)

    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={google_client_id}&"
        f"redirect_uri={callback_url}&"
        f"response_type=code&"
        f"scope=email profile&"
        f"access_type=offline"
    )
    return JSONResponse({"auth_url": auth_url})

async def google_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        return JSONResponse({"error": "No code provided"}, status_code=400)

    try:
        # Exchange code for tokens
        data = {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": os.getenv("GOOGLE_CALLBACK_URL")
        }
        async with httpx.AsyncClient() as client:
            token_resp = await client.post("https://oauth2.googleapis.com/token", data=data)
            token_data = token_resp.json()

        # Get user info
        async with httpx.AsyncClient() as client:
            user_resp = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            user_info = user_resp.json()

        email = user_info["email"]

        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(email=email, is_verified=True)
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                user.is_verified = True
                db.commit()
        finally:
            db.close()

        # Redirect to frontend dashboard
        return RedirectResponse(url="/dashboard", status_code=302)

    except Exception as e:
        return JSONResponse({"error": "Google login failed"}, status_code=400)

# Define routes
auth_router = Router([
    Route("/signup", signup, methods=["POST"]),
    Route("/verify", verify_code, methods=["POST"]),
    Route("/google", google_auth, methods=["GET"]),
    Route("/google/callback", google_callback, methods=["GET"]),
])