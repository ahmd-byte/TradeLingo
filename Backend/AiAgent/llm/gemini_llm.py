from __future__ import annotations

import time
import hashlib
from google import genai
from google.genai import types
from config import (
    GEMINI_API_KEY, GEMINI_MODEL,
    LLM_TEMPERATURE, LLM_MAX_TOKENS,
    MAX_RETRIES, RETRY_BASE_DELAY, REQUEST_COOLDOWN,
)


class LLMResponse:
    """Holds both the thinking process and the final answer."""
    def __init__(self, text: str, thinking: str | None = None):
        self.text = text
        self.thinking = thinking


def _parse_thinking(raw: str | None) -> tuple[str, str | None]:
    """
    Split a raw LLM response that uses <think>...</think> tags.
    Returns (answer, thinking_text_or_None).
    """
    if not raw:
        return "", None
    import re
    match = re.search(r"<think>(.*?)</think>", raw, re.DOTALL)
    if match:
        thinking = match.group(1).strip()
        answer = raw[:match.start()] + raw[match.end():]
        return answer.strip(), thinking
    return raw.strip(), None


class GeminiLLM:
    """Thin wrapper around the Gemini generative model (google-genai SDK)."""

    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model = GEMINI_MODEL
        self.config = types.GenerateContentConfig(
            temperature=LLM_TEMPERATURE,
            max_output_tokens=LLM_MAX_TOKENS,
        )
        # Conversation history for multi-turn chat
        self.chat = self.client.chats.create(
            model=self.model,
            config=self.config,
        )
        # Simple response cache: hash(prompt) → (text, thinking)
        self._cache: dict[str, tuple[str, str | None]] = {}
        # Timestamp of last API call (for cooldown)
        self._last_call: float = 0.0

    #Core helpers

    def _wait_cooldown(self):
        """Throttle requests to stay within free-tier rate limits."""
        elapsed = time.time() - self._last_call
        if elapsed < REQUEST_COOLDOWN:
            time.sleep(REQUEST_COOLDOWN - elapsed)

    def _call_with_retry(self, api_call):
        """
        Execute *api_call* (a zero-arg lambda) with exponential backoff
        on 429 (ResourceExhausted) errors.
        """
        for attempt in range(MAX_RETRIES + 1):
            try:
                self._wait_cooldown()
                result = api_call()
                self._last_call = time.time()
                return result
            except Exception as e:
                err = str(e)
                is_quota = "429" in err or "ResourceExhausted" in err or "quota" in err.lower()
                if is_quota and attempt < MAX_RETRIES:
                    delay = RETRY_BASE_DELAY * (2 ** attempt)
                    print(f"  ⏳ Quota limit hit — retrying in {delay}s (attempt {attempt + 1}/{MAX_RETRIES})...")
                    time.sleep(delay)
                else:
                    raise

    @staticmethod
    def _cache_key(text: str) -> str:
        return hashlib.md5(text.encode()).hexdigest()

    #Public API

    def generate(self, prompt: str, use_cache: bool = True) -> LLMResponse:
        """Single-turn generation (no memory of previous messages)."""
        key = self._cache_key(prompt)
        if use_cache and key in self._cache:
            text, thinking = self._cache[key]
            return LLMResponse(text, thinking)

        response = self._call_with_retry(
            lambda: self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=self.config,
            )
        )
        text, thinking = _parse_thinking(response.text)
        self._cache[key] = (text, thinking)
        return LLMResponse(text, thinking)

    def chat_send(self, message: str) -> LLMResponse:
        """Multi-turn chat — keeps conversation history."""
        response = self._call_with_retry(
            lambda: self.chat.send_message(message=message)
        )
        raw = response.text or ""
        text, thinking = _parse_thinking(raw)
        return LLMResponse(text, thinking)

    def reset_chat(self):
        """Start a fresh conversation."""
        self.chat = self.client.chats.create(
            model=self.model,
            config=self.config,
        )
        self._cache.clear()
