"""
Seed script — insert mock trade data into the MongoDB 'trades' collection.

Usage:
    python seed_trades.py                   # uses first user in DB
    python seed_trades.py <user_id>         # target a specific user
"""

import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# ---------------------------------------------------------------------------
# Mock trades — realistic mix of scalp, day, and swing trades
# ---------------------------------------------------------------------------
MOCK_TRADES = [
  {
    "symbol": "AAPL",
    "entry_time": "2026-01-02T09:35:00Z",
    "exit_time": "2026-01-02T15:10:00Z",
    "entry_price": 185.20,
    "exit_price": 187.90,
    "holding_duration_minutes": 335,
    "created_at": "2026-01-02T15:11:00Z"
  },
  {
    "symbol": "TSLA",
    "entry_time": "2026-01-04T10:15:00Z",
    "exit_time": "2026-01-04T14:45:00Z",
    "entry_price": 242.50,
    "exit_price": 239.10,
    "holding_duration_minutes": 270,
    "created_at": "2026-01-04T14:46:00Z"
  },
  {
    "symbol": "NVDA",
    "entry_time": "2026-01-06T09:50:00Z",
    "exit_time": "2026-01-07T11:20:00Z",
    "entry_price": 510.00,
    "exit_price": 522.40,
    "holding_duration_minutes": 1530,
    "created_at": "2026-01-07T11:21:00Z"
  },
  {
    "symbol": "MSFT",
    "entry_time": "2026-01-08T13:10:00Z",
    "exit_time": "2026-01-10T10:00:00Z",
    "entry_price": 375.00,
    "exit_price": 380.25,
    "holding_duration_minutes": 2700,
    "created_at": "2026-01-10T10:01:00Z"
  },

  {
    "symbol": "BTCUSDT",
    "entry_time": "2026-01-15T02:10:00Z",
    "exit_time": "2026-01-15T03:25:00Z",
    "entry_price": 43250.00,
    "exit_price": 43510.00,
    "holding_duration_minutes": 75,
    "created_at": "2026-01-15T03:26:00Z"
  },
  {
    "symbol": "ETHUSDT",
    "entry_time": "2026-01-16T05:45:00Z",
    "exit_time": "2026-01-16T06:10:00Z",
    "entry_price": 2385.00,
    "exit_price": 2402.50,
    "holding_duration_minutes": 25,
    "created_at": "2026-01-16T06:11:00Z"
  },
  {
    "symbol": "SOLUSDT",
    "entry_time": "2026-01-17T09:20:00Z",
    "exit_time": "2026-01-17T09:55:00Z",
    "entry_price": 105.40,
    "exit_price": 103.80,
    "holding_duration_minutes": 35,
    "created_at": "2026-01-17T09:56:00Z"
  },
  {
    "symbol": "BTCUSDT",
    "entry_time": "2026-01-18T01:05:00Z",
    "exit_time": "2026-01-18T02:00:00Z",
    "entry_price": 43700.00,
    "exit_price": 43980.00,
    "holding_duration_minutes": 55,
    "created_at": "2026-01-18T02:01:00Z"
  },
  {
    "symbol": "ETHUSDT",
    "entry_time": "2026-01-19T04:30:00Z",
    "exit_time": "2026-01-19T05:10:00Z",
    "entry_price": 2420.00,
    "exit_price": 2395.00,
    "holding_duration_minutes": 40,
    "created_at": "2026-01-19T05:11:00Z"
  },
  {
    "symbol": "XRPUSDT",
    "entry_time": "2026-01-20T07:15:00Z",
    "exit_time": "2026-01-20T07:50:00Z",
    "entry_price": 0.62,
    "exit_price": 0.65,
    "holding_duration_minutes": 35,
    "created_at": "2026-01-20T07:51:00Z"
  },
  {
    "symbol": "BTCUSDT",
    "entry_time": "2026-01-22T03:40:00Z",
    "exit_time": "2026-01-22T04:05:00Z",
    "entry_price": 44120.00,
    "exit_price": 44010.00,
    "holding_duration_minutes": 25,
    "created_at": "2026-01-22T04:06:00Z"
  },
  {
    "symbol": "SOLUSDT",
    "entry_time": "2026-01-23T08:05:00Z",
    "exit_time": "2026-01-23T08:45:00Z",
    "entry_price": 110.20,
    "exit_price": 112.10,
    "holding_duration_minutes": 40,
    "created_at": "2026-01-23T08:46:00Z"
  },
  {
    "symbol": "ETHUSDT",
    "entry_time": "2026-01-25T06:25:00Z",
    "exit_time": "2026-01-25T07:05:00Z",
    "entry_price": 2455.00,
    "exit_price": 2470.00,
    "holding_duration_minutes": 40,
    "created_at": "2026-01-25T07:06:00Z"
  },
  {
    "symbol": "BTCUSDT",
    "entry_time": "2026-01-27T02:30:00Z",
    "exit_time": "2026-01-27T03:10:00Z",
    "entry_price": 44800.00,
    "exit_price": 45120.00,
    "holding_duration_minutes": 40,
    "created_at": "2026-01-27T03:11:00Z"
  },
  {
    "symbol": "XRPUSDT",
    "entry_time": "2026-01-29T09:10:00Z",
    "exit_time": "2026-01-29T09:40:00Z",
    "entry_price": 0.66,
    "exit_price": 0.64,
    "holding_duration_minutes": 30,
    "created_at": "2026-01-29T09:41:00Z"
  }
]


def _parse_iso(s: str) -> datetime:
    """Parse an ISO 8601 string like '2026-01-02T09:35:00Z' to a datetime."""
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


async def seed(user_id: str | None = None):
    client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    db = client[DATABASE_NAME]

    # Resolve user_id
    if not user_id:
        user = await db["users"].find_one({}, sort=[("created_at", -1)])
        if not user:
            print("No users in the database. Create an account first.")
            client.close()
            return
        user_id = str(user["_id"])
        print(f"Using most recent user: {user.get('email', user_id)}")

    docs = []
    for t in MOCK_TRADES:
        docs.append(
            {
                "user_id": user_id,
                "symbol": t["symbol"],
                "entry_time": _parse_iso(t["entry_time"]),
                "exit_time": _parse_iso(t["exit_time"]),
                "entry_price": t["entry_price"],
                "exit_price": t["exit_price"],
                "holding_duration_minutes": t["holding_duration_minutes"],
                "created_at": _parse_iso(t["created_at"]),
            }
        )

    result = await db["trades"].insert_many(docs)
    print(f"Inserted {len(result.inserted_ids)} mock trades for user {user_id}")

    # Print summary
    print("\n--- Mock Trades Inserted ---")
    for d in docs:
        pnl = ((d["exit_price"] - d["entry_price"]) / d["entry_price"]) * 100
        direction = "WIN" if pnl > 0 else "LOSS"
        print(
            f"  {d['symbol']:6s}  entry=${d['entry_price']:.2f}  exit=${d['exit_price']:.2f}  "
            f"hold={d['holding_duration_minutes']:.0f}min  {direction} ({pnl:+.2f}%)"
        )

    client.close()
    print("\nDone.")


if __name__ == "__main__":
    target_user = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(seed(target_user))
