"""
LLM Service Module
Handles all interactions with the Gemini API.
Ensures structured JSON output for deterministic processing.
"""

import json
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


class LLMService:
    """Wrapper around Gemini API for structured LLM calls."""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or GEMINI_API_KEY
        self.client = genai.Client(api_key=self.api_key)
        self.model = "gemini-2.5-flash-lite"
    
    def call_gemini_json(self, prompt, json_schema=None):
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
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt_with_json_instruction,
            )
            
            response_text = response.text.strip()
            
            # Clean up markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            parsed_response = json.loads(response_text)
            
            return parsed_response
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse Gemini response as JSON: {e}\nResponse: {response_text}")
        except Exception as e:
            raise RuntimeError(f"LLM API call failed: {e}")
    
    def call_gemini_text(self, prompt):
        """
        Call Gemini for plain text response (no JSON parsing).
        
        Args:
            prompt (str): The prompt to send to Gemini
        
        Returns:
            str: Text response
        """
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"LLM API call failed: {e}")
