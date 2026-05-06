import httpx
import os
from typing import Optional

NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

# Available Models on NVIDIA API
AVAILABLE_MODELS = {
    "nemotron": "nvidia/llama-3.1-nemotron-70b-instruct",      # Nemotron 3 (Recommended)
    "deepseek": "deepseek-ai/deepseek-coder-33b-instruct",     # DeepSeek
    "qwen": "qwen/qwen2.5-72b-instruct",                       # Qwen
    "gemma": "google/gemma-2-27b-it",                          # Gemini-style
    "llama": "meta/llama-3.1-70b-instruct",                    # Llama 3.1
    "grok": "nvidia/llama-3.1-nemotron-70b-instruct",          # Grok-like reasoning
}

DEFAULT_MODEL = "nemotron"

async def call_nvidia_ai(
    prompt: str, 
    system_prompt: str = None, 
    model: str = DEFAULT_MODEL
) -> str:
    
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        return "AI service is currently unavailable. Please configure your NVIDIA API key."

    model_name = AVAILABLE_MODELS.get(model.lower(), AVAILABLE_MODELS[DEFAULT_MODEL])

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
        "max_tokens": 1024,
        "temperature": 0.4,
        "top_p": 0.9
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(NVIDIA_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"NVIDIA AI Error: {e}")
        return "Sorry, I'm having trouble connecting to the AI right now. Please try again later."