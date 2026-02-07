import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agent import TradeLingAgent


def print_banner():
    print("=" * 60)
    print("  🎓  TradeLingo — AI Trading Education Agent")
    print("=" * 60)
    print()
    print("Commands:")
    print("  /trades    — Full trade history analysis")
    print("  /behavior  — Behaviour & psychology analysis")
    print("  /review N  — Review trade #N  (e.g. /review 2)")
    print("  /habit     — Quick habit / discipline check")
    print("  /reset     — Reset conversation")
    print("  /quit      — Exit")
    print()


def print_response(resp):
    """Print thinking (if any) then the final answer."""
    if resp.thinking:
        print("\n💭 Thinking...")
        print("-" * 40)
        for line in resp.thinking.strip().splitlines():
            print(f"  {line}")
        print("-" * 40)
    print(f"\nTradeLingo:\n{resp.text}\n")


def main():
    print_banner()

    print("⏳ Initialising agent (connecting to Gemini)...")
    try:
        agent = TradeLingAgent()
    except Exception as e:
        print(f"\n❌ Failed to initialise agent: {e}")
        print("   → Make sure GEMINI_API_KEY is set in .env and google-genai is installed.")
        print("   → If quota exceeded, wait a few minutes and try again (free tier resets).")
        return

    print("✅ Agent ready! Start chatting.\n")

    while True:
        try:
            user_input = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n👋 Goodbye!")
            break

        if not user_input:
            continue

        # ── Slash commands ────────────────────────────────────
        if user_input.lower() == "/quit":
            print("👋 Goodbye!")
            break

        if user_input.lower() == "/reset":
            agent.reset()
            print("🔄 Conversation reset.\n")
            continue

        if user_input.lower() == "/trades":
            print("\n⏳ Analysing your trade history...")
            resp = agent.analyze_trades()
            print_response(resp)
            continue

        if user_input.lower() == "/behavior":
            print("\n⏳ Analysing your trading behaviour...")
            resp = agent.analyze_behavior()
            print_response(resp)
            continue

        if user_input.lower().startswith("/review"):
            parts = user_input.split()
            if len(parts) == 2 and parts[1].isdigit():
                trade_id = int(parts[1])
                print(f"\n⏳ Reviewing trade #{trade_id}...")
                resp = agent.review_single_trade(trade_id)
                print_response(resp)
            else:
                print("Usage: /review N  (e.g. /review 2)\n")
            continue

        if user_input.lower() == "/habit":
            print("\n⏳ Running habit check...")
            resp = agent.habit_check()
            print_response(resp)
            continue

        # ── Normal chat ───────────────────────────────────────
        try:
            resp = agent.chat(user_input)
            print_response(resp)
        except Exception as e:
            print(f"\n❌ Error: {e}\n")


if __name__ == "__main__":
    main()
