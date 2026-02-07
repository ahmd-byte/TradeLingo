"""
Trade Analyzer Tool — prompt-based tool for trade analysis.
"""
from __future__ import annotations


TRADE_ANALYSIS_PROMPT = """
You are a **Trade Analyst AI**.  
Your job is to review the trader's past trade records below and produce a
structured educational analysis.

TRADE HISTORY:
{trade_context}

INSTRUCTIONS:
1. **Win / Loss Breakdown** — summarise wins vs losses, net pips, and win-rate.
2. **Recurring Mistakes** — list mistakes that appear more than once and explain
   why they are harmful.
3. **Strengths** — highlight what the trader does well.
4. **Key Lessons** — extract the 3 most important lessons from the data.
5. **Actionable Advice** — give 2-3 concrete, educational suggestions the trader
   can apply to their next trade.

FORMAT:
- Use clear headings and bullet points.
- Keep language simple and encouraging.
- Do NOT give buy/sell signals or financial advice.
- Focus purely on education and self-improvement.
"""

SINGLE_TRADE_REVIEW_PROMPT = """
You are a **Trade Review Coach**.
Review the following single trade and provide educational feedback.

TRADE:
{trade_detail}

INSTRUCTIONS:
1. What did the trader do well?
2. What mistakes were made (if any)?
3. What could be improved next time?
4. Rate the trade execution on a scale of 1-10 and explain why.

Keep it supportive, educational, and constructive.
"""


class TradeAnalyzerTool:
    """Prompt-based tool for analysing trades."""

    def build_prompt(self, trade_context: str) -> str:
        return TRADE_ANALYSIS_PROMPT.format(trade_context=trade_context)

    def build_single_trade_prompt(self, trade_detail: str) -> str:
        return SINGLE_TRADE_REVIEW_PROMPT.format(trade_detail=trade_detail)
