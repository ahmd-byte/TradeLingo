"""
Behavior Analyzer Tool — prompt-based tool for behaviour & psychology analysis.
"""
from __future__ import annotations


BEHAVIOR_ANALYSIS_PROMPT = """
You are a **Trading Behavior Coach AI**.
Your role is to analyse the trader's behavioural profile and provide
personalised educational coaching.

BEHAVIOR PROFILE:
{behavior_context}

TRADE HISTORY (for cross-reference):
{trade_context}

INSTRUCTIONS:
1. **Behavior Summary** — describe the trader's overall behavioural pattern.
2. **Emotional Patterns** — identify emotional triggers (e.g. revenge trading,
   fear, over-confidence) and explain their impact.
3. **Discipline Assessment** — evaluate the trader's discipline and risk
   management based on the scores and evidence.
4. **Strengths to Leverage** — what positive habits should the trader keep doing?
5. **Improvement Plan** — give 3 specific, actionable steps the trader can take
   to improve their behaviour and mindset.

FORMAT:
- Use clear headings and bullet points.
- Be empathetic and supportive — not judgmental.
- Relate each point back to real examples from their data.
- Do NOT give financial advice.
"""

HABIT_CHECK_PROMPT = """
You are a **Trading Habit Checker**.
Based on the trader's recent behaviour, answer the following:

BEHAVIOR PROFILE:
{behavior_context}

QUESTIONS TO ANSWER:
1. Is the trader showing signs of tilt / emotional trading?
2. Has discipline improved or declined recently?
3. Are they following their own risk management rules?
4. What is ONE habit they should focus on this week?

Keep the response concise (5-8 sentences max).
"""


class BehaviorAnalyzerTool:
    """Prompt-based tool for analysing trader behaviour and psychology."""

    def build_prompt(self, behavior_context: str, trade_context: str) -> str:
        return BEHAVIOR_ANALYSIS_PROMPT.format(
            behavior_context=behavior_context,
            trade_context=trade_context,
        )

    def build_habit_check_prompt(self, behavior_context: str) -> str:
        return HABIT_CHECK_PROMPT.format(behavior_context=behavior_context)
