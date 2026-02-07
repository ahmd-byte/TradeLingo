"""
TradeLingo AI Agent Configuration
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file (at project root or parent)
load_dotenv()

# ─── Gemini API ───────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"

# ─── Agent Settings ──────────────────────────────────────────
AGENT_NAME = "TradeLingo"
AGENT_VERSION = "0.1.0"

# Temperature: lower = more focused/deterministic, higher = more creative
LLM_TEMPERATURE = 0.7
LLM_MAX_TOKENS = 4096

# ─── Retry / Rate-limit Settings ─────────────────────────────
MAX_RETRIES = 3               # Number of retries on 429 / transient errors
RETRY_BASE_DELAY = 5          # Base delay in seconds (doubles each retry)
REQUEST_COOLDOWN = 1.5        # Seconds to wait between consecutive API calls

# ─── User Levels ─────────────────────────────────────────────
USER_LEVELS = ["beginner", "intermediate", "advanced"]
DEFAULT_USER_LEVEL = "beginner"
