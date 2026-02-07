"""
Decision Loop — Observe → Analyse → Decide
Classifies user intent and builds the right prompt using memory context.
"""
from __future__ import annotations

from memory.memory_manager import MemoryManager
from tools.trade_analyzer import TradeAnalyzerTool
from tools.behavior_analyzer import BehaviorAnalyzerTool


TRADE_KEYWORDS = [
    "trade", "trades", "entry", "exit", "win", "loss", "pips",
    "journal", "review", "history", "analyze trade", "past trade",
]
BEHAVIOR_KEYWORDS = [
    "behavior", "behaviour", "emotion", "revenge", "discipline",
    "habit", "psychology", "mindset", "tilt", "overtrading",
    "risk management", "over-leverage",
]
CURRICULUM_KEYWORDS = [
    "learn", "teach", "lesson", "topic", "course", "curriculum",
    "quiz", "explain", "what is", "how does", "next lesson",
]


def _classify_intent(message: str) -> str:
    """Lightweight keyword-based intent classifier."""
    msg = message.lower()
    scores = {
        "trade_analysis": sum(1 for kw in TRADE_KEYWORDS if kw in msg),
        "behavior_analysis": sum(1 for kw in BEHAVIOR_KEYWORDS if kw in msg),
        "curriculum": sum(1 for kw in CURRICULUM_KEYWORDS if kw in msg),
    }
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "general"


class DecisionLoop:
    """
    Observe → Analyse → Decide.
    Builds the right prompt based on user intent and memory context.
    """

    def __init__(self, memory: MemoryManager):
        self.memory = memory
        self.trade_tool = TradeAnalyzerTool()
        self.behavior_tool = BehaviorAnalyzerTool()

    def decide(self, user_message: str) -> str:
        """Build the right prompt based on user intent + memory context."""
        obs = {
            "user_message": user_message,
            "trade_context": self.memory.get_trade_history_context(),
            "behavior_context": self.memory.get_behavior_context(),
            "curriculum_context": self.memory.get_curriculum_context(),
        }
        intent = _classify_intent(user_message)

        if intent == "trade_analysis":
            return self.trade_tool.build_prompt(obs["trade_context"])
        if intent == "behavior_analysis":
            return self.behavior_tool.build_prompt(
                obs["behavior_context"], obs["trade_context"]
            )
        if intent == "curriculum":
            return self._build_curriculum_prompt(obs)
        return self._build_general_prompt(obs)

    @staticmethod
    def _build_curriculum_prompt(obs: dict) -> str:
        return (
            "You are a **Trading Education Tutor**.\n\n"
            f"CURRICULUM PROGRESS:\n{obs['curriculum_context']}\n\n"
            f"USER BEHAVIOR (for personalisation):\n{obs['behavior_context']}\n\n"
            f"USER MESSAGE:\n{obs['user_message']}\n\n"
            "INSTRUCTIONS:\n"
            "- If the user asks to continue learning, teach the current topic in a\n"
            "  structured, beginner-friendly way.\n"
            "- If the user asks about a specific concept, explain it clearly.\n"
            "- Adapt your explanation to their level and learning style.\n"
            "- Include a small practice question or quiz at the end.\n"
            "- Use analogies and examples when possible."
        )

    @staticmethod
    def _build_general_prompt(obs: dict) -> str:
        return (
            "You are **TradeLingo**, an AI Trading Education Agent.\n\n"
            f"MEMORY CONTEXT (use this to personalise your response):\n"
            f"{obs['trade_context']}\n\n"
            f"{obs['behavior_context']}\n\n"
            f"{obs['curriculum_context']}\n\n"
            f"USER MESSAGE:\n{obs['user_message']}\n\n"
            "INSTRUCTIONS:\n"
            "- Answer the user's question in an educational, supportive way.\n"
            "- Personalise based on their level, history, and behaviour.\n"
            "- If they seem to be struggling with something recurring (e.g. revenge\n"
            "  trading), gently address it.\n"
            "- Always focus on education, never give financial advice.\n"
            "- Keep responses structured and concise."
        )
