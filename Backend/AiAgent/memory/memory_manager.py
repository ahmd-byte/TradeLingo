
from __future__ import annotations

from memory.mock_data import MockDatabase


class MemoryManager:
    """Turns raw DB records into formatted context the LLM can consume."""

    def __init__(self, db: MockDatabase | None = None):
        self.db = db or MockDatabase()
    

    def get_trade_history_context(self) -> str:
        trades = self.db.get_all_trades()
        if not trades:
            return "No trade history available yet."

        lines = ["=== PAST TRADE HISTORY ==="]
        for t in trades:
            lines.append(
                f"• [{t['date']}] {t['pair']} {t['direction'].upper()} | "
                f"Entry: {t['entry']} → Exit: {t['exit']} | "
                f"Result: {t['result'].upper()} ({t['pips']:+} pips)\n"
                f"  Notes: {t['notes']}\n"
                f"  Mistakes: {', '.join(t['mistakes']) if t['mistakes'] else 'None'}\n"
                f"  Lessons: {', '.join(t['lessons'])}"
            )

        summary = self._trade_summary(trades)
        lines.append(f"\n--- Summary ---\n{summary}")
        return "\n".join(lines)

    def _trade_summary(self, trades: list[dict]) -> str:
        wins = sum(1 for t in trades if t["result"] == "win")
        losses = len(trades) - wins
        total_pips = sum(t["pips"] for t in trades)
        all_mistakes = []
        for t in trades:
            all_mistakes.extend(t["mistakes"])
        return (
            f"Total trades: {len(trades)} | Wins: {wins} | Losses: {losses} | "
            f"Win rate: {wins / len(trades):.0%} | Net pips: {total_pips:+}\n"
            f"Recurring mistakes: {', '.join(set(all_mistakes)) if all_mistakes else 'None'}"
        )

    # ── Behavior Context ──────────────────────────────────────

    def get_behavior_context(self) -> str:
        b = self.db.get_user_behavior()
        return (
            "=== USER BEHAVIOR PROFILE ===\n"
            f"Level: {b['level']}\n"
            f"Win rate: {b['win_rate']:.0%}\n"
            f"Risk mgmt score: {b['risk_management_score']}/10\n"
            f"Discipline score: {b['discipline_score']}/10\n"
            f"Common mistakes: {', '.join(b['common_mistakes'])}\n"
            f"Strengths: {', '.join(b['strengths'])}\n"
            f"Emotional triggers: {', '.join(b['emotional_triggers'])}\n"
            f"Preferred pairs: {', '.join(b['preferred_pairs'])}\n"
            f"Preferred timeframe: {b['preferred_timeframe']}\n"
            f"Learning style: {b['learning_style']}\n"
            f"Topics interested: {', '.join(b['topics_interested'])}"
        )

    # ── Curriculum Context ────────────────────────────────────

    def get_curriculum_context(self) -> str:
        c = self.db.get_curriculum()
        completed = "\n".join(
            f"  ✓ {t['topic']} (score: {t['understanding_score']}/10, taught: {t['date_taught']})"
            for t in c["completed_topics"]
        )
        upcoming = ", ".join(c["upcoming_topics"]) if c["upcoming_topics"] else "None"
        quizzes = "\n".join(
            f"  • {q['topic']}: {q['score']}/{q['max']}"
            for q in c["quiz_results"]
        )
        return (
            "=== CURRICULUM PROGRESS ===\n"
            f"Completed topics:\n{completed}\n"
            f"Current topic: {c['current_topic']}\n"
            f"Upcoming topics: {upcoming}\n"
            f"Quiz results:\n{quizzes}"
        )

    # ── Full Context ──────────────────────────────────────────

    def get_full_memory_context(self) -> str:
        return "\n\n".join([
            self.get_trade_history_context(),
            self.get_behavior_context(),
            self.get_curriculum_context(),
        ])
