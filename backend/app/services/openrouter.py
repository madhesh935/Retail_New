from __future__ import annotations

from typing import Any

import httpx

from app.core.config import Settings, settings


class OpenRouterError(RuntimeError):
    """A sanitized error raised for failed OpenRouter requests."""

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


class OpenRouterClient:
    def __init__(self, config: Settings = settings):
        self.config = config

    def _headers(self) -> dict[str, str]:
        if not self.config.OPENROUTER_API_KEY:
            raise OpenRouterError("OpenRouter API key is not configured", 503)

        return {
            "Authorization": f"Bearer {self.config.OPENROUTER_API_KEY}",
            "HTTP-Referer": self.config.OPENROUTER_SITE_URL,
            "X-Title": self.config.OPENROUTER_APP_NAME,
            "Content-Type": "application/json",
        }

    async def _post(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        url = f"{self.config.OPENROUTER_BASE_URL.rstrip('/')}/{path.lstrip('/')}"
        try:
            async with httpx.AsyncClient(
                timeout=self.config.OPENROUTER_TIMEOUT_SECONDS
            ) as client:
                response = await client.post(url, headers=self._headers(), json=payload)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as exc:
            detail = "OpenRouter rejected the request"
            try:
                error_body = exc.response.json()
                detail = (
                    error_body.get("error", {}).get("message")
                    or error_body.get("message")
                    or detail
                )
            except (TypeError, ValueError):
                pass
            raise OpenRouterError(detail, exc.response.status_code) from exc
        except httpx.RequestError as exc:
            raise OpenRouterError("Unable to reach OpenRouter") from exc
        except (KeyError, TypeError, ValueError) as exc:
            raise OpenRouterError("OpenRouter returned an invalid response") from exc

    async def create_embeddings(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        data = await self._post(
            "/embeddings",
            {
                "model": self.config.OPENROUTER_EMBEDDING_MODEL,
                "input": texts,
                "encoding_format": "float",
            },
        )
        rows = sorted(data["data"], key=lambda row: row["index"])
        embeddings = [row["embedding"] for row in rows]
        if len(embeddings) != len(texts):
            raise OpenRouterError("OpenRouter returned an incomplete embedding batch")
        return embeddings

    async def create_chat_completion(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float = 0.2,
        max_tokens: int = 700,
    ) -> dict[str, Any]:
        data = await self._post(
            "/chat/completions",
            {
                "model": self.config.OPENROUTER_CHAT_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
        )
        content = data["choices"][0]["message"]["content"]
        if not isinstance(content, str):
            raise OpenRouterError("OpenRouter returned an empty chat response")
        return {
            "content": content,
            "model": data.get("model", self.config.OPENROUTER_CHAT_MODEL),
            "usage": data.get("usage"),
        }
