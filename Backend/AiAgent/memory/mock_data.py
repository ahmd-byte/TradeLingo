from __future__ import annotations


class MockDatabase:
    """In-memory mock storage for trades, behaviour, and curriculum."""

    def __init__(self):
        # ── Past Trade DB ─────────────────────────────────────
        self.past_trades = [
            {
                "id": 1,
                "pair": "EUR/USD",
                "direction": "long",
                "entry": 1.0850,
                "exit": 1.0920,
                "result": "win",
                "pips": 70,
                "date": "2026-01-15",
                "notes": "Followed support bounce strategy. Held for 3 hours.",
                "mistakes": [],
                "lessons": ["Patience paid off", "Support level held as expected"],
            },
            {
                "id": 2,
                "pair": "GBP/USD",
                "direction": "short",
                "entry": 1.2700,
                "exit": 1.2750,
                "result": "loss",
                "pips": -50,
                "date": "2026-01-20",
                "notes": "Entered against the trend. Panic closed.",
                "mistakes": ["Counter-trend entry", "No stop-loss", "Emotional exit"],
                "lessons": ["Always trade with the trend", "Set stop-loss before entry"],
            },
            {
                "id": 3,
                "pair": "USD/JPY",
                "direction": "long",
                "entry": 148.50,
                "exit": 149.10,
                "result": "win",
                "pips": 60,
                "date": "2026-01-28",
                "notes": "Breakout trade above resistance. Managed well.",
                "mistakes": [],
                "lessons": ["Breakout confirmation works", "Trailed stop properly"],
            },
            {
                "id": 4,
                "pair": "EUR/USD",
                "direction": "long",
                "entry": 1.0900,
                "exit": 1.0870,
                "result": "loss",
                "pips": -30,
                "date": "2026-02-01",
                "notes": "Revenge trade after previous loss. Over-leveraged.",
                "mistakes": ["Revenge trading", "Over-leverage", "No plan"],
                "lessons": ["Don't trade emotionally", "Stick to risk management"],
            },
            {
                "id": 5,
                "pair": "BTC/USD",
                "direction": "long",
                "entry": 42000,
                "exit": 43500,
                "result": "win",
                "pips": 1500,
                "date": "2026-02-05",
                "notes": "Spotted bullish engulfing on daily chart. Good R:R.",
                "mistakes": [],
                "lessons": ["Candlestick patterns on higher TF are reliable"],
            },
        ]

        # ── Behavior DB ───────────────────────────────────────
        self.user_behavior = {
            "user_id": "user_001",
            "level": "beginner",
            "total_trades": 5,
            "win_rate": 0.60,
            "common_mistakes": [
                "Revenge trading",
                "No stop-loss",
                "Counter-trend entries",
                "Over-leverage",
            ],
            "strengths": [
                "Good at breakout trades",
                "Patience on winning trades",
                "Uses candlestick patterns",
            ],
            "emotional_triggers": [
                "Tends to revenge-trade after a loss",
                "Over-leverages when confident",
            ],
            "preferred_pairs": ["EUR/USD", "GBP/USD", "USD/JPY"],
            "preferred_timeframe": "1H",
            "risk_management_score": 4,
            "discipline_score": 5,
            "learning_style": "visual",
            "sessions_completed": 3,
            "topics_interested": ["support/resistance", "candlestick patterns", "risk management"],
        }

        # ── Curriculum Memory ─────────────────────────────────
        self.curriculum = {
            "completed_topics": [
                {"topic": "What is Forex?", "date_taught": "2026-01-10", "understanding_score": 8},
                {"topic": "Support and Resistance Basics", "date_taught": "2026-01-14", "understanding_score": 7},
                {"topic": "Candlestick Patterns Introduction", "date_taught": "2026-01-22", "understanding_score": 6},
            ],
            "current_topic": "Risk Management Fundamentals",
            "upcoming_topics": [
                "Position Sizing",
                "Trading Psychology",
                "Trend Following Strategies",
                "Building a Trading Plan",
            ],
            "quiz_results": [
                {"topic": "What is Forex?", "score": 8, "max": 10},
                {"topic": "Support and Resistance", "score": 6, "max": 10},
            ],
        }

    # ── Retrieval helpers ─────────────────────────────────────

    def get_all_trades(self) -> list[dict]:
        return self.past_trades

    def get_winning_trades(self) -> list[dict]:
        return [t for t in self.past_trades if t["result"] == "win"]

    def get_losing_trades(self) -> list[dict]:
        return [t for t in self.past_trades if t["result"] == "loss"]

    def get_recent_trades(self, n: int = 3) -> list[dict]:
        return self.past_trades[-n:]

    def get_user_behavior(self) -> dict:
        return self.user_behavior

    def get_curriculum(self) -> dict:
        return self.curriculum

    def get_completed_topics(self) -> list[dict]:
        return self.curriculum["completed_topics"]

    def get_current_topic(self) -> str:
        return self.curriculum["current_topic"]

    def get_upcoming_topics(self) -> list[str]:
        return self.curriculum["upcoming_topics"]

    def add_trade(self, trade: dict):
        trade["id"] = len(self.past_trades) + 1
        self.past_trades.append(trade)

    def add_completed_topic(self, topic: dict):
        self.curriculum["completed_topics"].append(topic)
        if self.curriculum["upcoming_topics"]:
            self.curriculum["current_topic"] = self.curriculum["upcoming_topics"].pop(0)
