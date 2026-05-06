import httpx
import os

NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

AVAILABLE_MODELS = {
    "nemotron": "nvidia/nemotron-3-super-120b-a12b",
}

async def call_nvidia_ai(
    prompt: str, 
    system_prompt: str = None, 
    model: str = "nemotron"
) -> str:
    api_key = os.getenv("NVIDIA_API_KEY")
    
    if not api_key:
        return (
            "NVIDIA_API_KEY is not set in Render environment variables.\n\n"
            "Fix: Go to your Render Dashboard → remindarin-backend → Environment → "
            "Add NVIDIA_API_KEY with your actual key from https://build.nvidia.com/"
        )

    model_name = AVAILABLE_MODELS.get(model.lower(), AVAILABLE_MODELS["nemotron"])

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model_name,
        "messages": messages,
        "max_tokens": 16384,
        "temperature": 1.0,
        "top_p": 0.95,
        "extra_body": {
            "chat_template_kwargs": {"enable_thinking": True},
            "reasoning_budget": 16384
        }
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(NVIDIA_API_URL, json=payload, headers=headers)
            
            if response.status_code != 200:
                error_detail = response.text[:500] if response.text else "No error body"
                return f"NVIDIA API Error {response.status_code}: {error_detail}"
            
            data = response.json()
            return data["choices"][0]["message"]["content"]

    except Exception as e:
        error_type = type(e).__name__
        return f"AI connection failed ({error_type}): {str(e)[:300]}"