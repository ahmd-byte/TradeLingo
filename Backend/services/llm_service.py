"""
LLM Service Module
Handles all interactions with the Gemini API.
Ensures structured JSON output for deterministic processing.
"""

import asyncio
import json
import os
import re
from google import genai
from langsmith import wrappers
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Max retries for rate-limited requests
MAX_RETRIES = 3
DEFAULT_RETRY_DELAY = 25  # seconds


class LLMService:
    """Wrapper around Gemini API for structured LLM calls."""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or GEMINI_API_KEY
        gemini_client = genai.Client(api_key=self.api_key)
        # Wrap with LangSmith tracing
        self.client = wrappers.wrap_gemini(
            gemini_client,
            tracing_extra={
                "tags": ["gemini", "tradelingo"],
                "metadata": {
                    "integration": "google-genai",
                },
            },
        )
        self.model = "gemini-2.5-flash-lite"
    
    def _extract_retry_delay(self, error_msg):
        """Extract retry delay from a 429 error message."""
        match = re.search(r'retry in (\d+(?:\.\d+)?)', str(error_msg), re.IGNORECASE)
        if match:
            return float(match.group(1)) + 1  # add 1s buffer
        return DEFAULT_RETRY_DELAY
    
    async def _call_with_retry(self, prompt):
        """Call Gemini with automatic retry on rate limit (429). Non-blocking."""
        last_error = None
        for attempt in range(MAX_RETRIES):
            try:
                # Run the synchronous SDK call in a thread to avoid blocking the event loop
                response = await asyncio.to_thread(
                    self.client.models.generate_content,
                    model=self.model,
                    contents=prompt,
                )
                return response
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    delay = self._extract_retry_delay(error_str)
                    print(f"[LLM] Rate limited (attempt {attempt + 1}/{MAX_RETRIES}). Retrying in {delay:.0f}s...")
                    last_error = e
                    await asyncio.sleep(delay)
                else:
                    raise RuntimeError(f"LLM API call failed: {e}") from e
        raise RuntimeError(f"LLM API call failed after {MAX_RETRIES} retries: {last_error}") from last_error
    
    async def call_gemini_json(self, prompt, json_schema=None):
        """
        Call Gemini and extract structured JSON response.
        
        Args:
            prompt (str): The prompt to send to Gemini
            json_schema (dict): Expected JSON schema for validation (optional)
        
        Returns:
            dict: Parsed JSON response
        """
        # Add instruction to force JSON output
        prompt_with_json_instruction = (
            f"{prompt}\n\n"
            "**IMPORTANT**: You MUST respond with ONLY valid JSON. "
            "Do not include any markdown markers (```json, ```, etc.). "
            "Respond with raw JSON only."
        )
        
        response = await self._call_with_retry(prompt_with_json_instruction)
        
        response_text = response.text.strip()
        
        # Clean up markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        try:
            parsed_response = json.loads(response_text)
            return parsed_response
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse Gemini response as JSON: {e}\nResponse: {response_text}") from e
    
    async def call_gemini_text(self, prompt):
        """
        Call Gemini for plain text response (no JSON parsing).
        
        Args:
            prompt (str): The prompt to send to Gemini
        
        Returns:
            str: Text response
        """
        response = await self._call_with_retry(prompt)
        return response.text


# Create a global instance for use across the application
llm_service = LLMService()
