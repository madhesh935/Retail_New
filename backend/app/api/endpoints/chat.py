from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import httpx
from app.core.config import settings
import json

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system_prompt: Optional[str] = "You are an intelligent retail assistant chatbot. Your responses should be strictly related to shop content, retail operations, store management, inventory, and customer service. Be helpful and concise."

@router.post("/")
async def chat_with_openrouter(request: ChatRequest):
    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key is not configured")

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:5173", # Update with your actual site URL
        "X-Title": "Retail Edge OS", # Update with your actual site name
        "Content-Type": "application/json"
    }
    
    # Ensure system prompt is the first message if provided
    messages_payload = [{"role": "system", "content": request.system_prompt}]
    for msg in request.messages:
        messages_payload.append({"role": msg.role, "content": msg.content})

    payload = {
        "model": "openai/gpt-3.5-turbo", # You can change this to any supported model on OpenRouter (e.g. meta-llama/llama-3-8b-instruct)
        "messages": messages_payload
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return {"reply": data["choices"][0]["message"]["content"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with OpenRouter: {str(e)}")
