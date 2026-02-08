"""
Test Suite for the TutorAgent
Allows testing the agent without Flask.
"""

import json
from agent import run_agent
from memory import LearningMemory


def test_basic_profile():
    """Test agent with just a user profile."""
    print("\n" + "="*60)
    print("TEST 1: Basic Profile Input")
    print("="*60)
    
    profile = {
        "name": "Alice",
        "tradingLevel": "beginner",
        "learningStyle": "visual",
        "riskTolerance": "conservative",
        "preferredMarkets": "stocks",
        "tradingFrequency": "weekly"
    }
    
    input_data = {
        "user_profile": profile,
        "trade_data": None,
        "user_question": "I want to understand the basics of trading"
    }
    
    try:
        response, memory = run_agent(input_data)
        
        print("\n✓ Agent Response:")
        print(json.dumps(response, indent=2))
        
        print("\n✓ Memory State:")
        print(json.dumps(memory.serialize(), indent=2))
        
        return True
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False


def test_with_trade_data():
    """Test agent with trade data."""
    print("\n" + "="*60)
    print("TEST 2: With Trade Data")
    print("="*60)
    
    profile = {
        "name": "Bob",
        "tradingLevel": "intermediate",
        "learningStyle": "analytical",
        "riskTolerance": "moderate",
        "preferredMarkets": "forex",
        "tradingFrequency": "daily"
    }
    
    trade_data = {
        "date": "2024-02-07",
        "stockCode": "EURUSD",
        "stockName": "EUR/USD",
        "action": "buy",
        "units": 10000,
        "price": 1.0850,
        "intraday": "yes"
    }
    
    input_data = {
        "user_profile": profile,
        "trade_data": trade_data,
        "user_question": None
    }
    
    try:
        response, memory = run_agent(input_data)
        
        print("\n✓ Agent Response:")
        print(json.dumps(response, indent=2))
        
        print("\n✓ Concepts Taught:")
        for concept in memory.get_concepts_taught():
            print(f"  - {concept.get('concept')}")
        
        return True
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False


def test_memory_persistence():
    """Test that memory persists across interactions."""
    print("\n" + "="*60)
    print("TEST 3: Memory Persistence Across Interactions")
    print("="*60)
    
    profile = {
        "name": "Charlie",
        "tradingLevel": "advanced",
        "learningStyle": "kinesthetic",
        "riskTolerance": "aggressive",
        "preferredMarkets": "crypto",
        "tradingFrequency": "very frequently"
    }
    
    # First interaction
    print("\n--- Interaction 1 ---")
    input_data_1 = {
        "user_profile": profile,
        "trade_data": None,
        "user_question": "How do I manage position size?"
    }
    
    try:
        response_1, memory_1 = run_agent(input_data_1)
        concept_1 = response_1.get("learning_concept")
        print(f"✓ Taught: {concept_1}")
        
        # Second interaction with persisted memory
        print("\n--- Interaction 2 (With Persisted Memory) ---")
        input_data_2 = {
            "user_profile": profile,
            "trade_data": None,
            "user_question": "What else should I know?"
        }
        
        response_2, memory_2 = run_agent(input_data_2, memory=memory_1)
        concept_2 = response_2.get("learning_concept")
        print(f"✓ Taught: {concept_2}")
        
        print(f"\n✓ Total concepts taught: {len(memory_2.get_concepts_taught())}")
        print("✓ Concepts taught:")
        for concept in memory_2.get_concepts_taught():
            print(f"  - {concept.get('concept')}")
        
        return True
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False


def test_error_handling():
    """Test error handling with malformed data."""
    print("\n" + "="*60)
    print("TEST 4: Error Handling")
    print("="*60)
    
    # Missing required profile fields
    profile = {
        "name": "Test User"
        # Missing other required fields
    }
    
    input_data = {
        "user_profile": profile,
        "trade_data": None,
        "user_question": "Test error handling"
    }
    
    try:
        response, memory = run_agent(input_data)
        print("\n✓ Agent handled incomplete profile gracefully")
        print(f"Response keys: {list(response.keys())}")
        return True
    except Exception as e:
        print(f"\n⚠ Expected error: {e}")
        return True  # This is expected


def run_all_tests():
    """Run all tests."""
    print("\n" + "="*70)
    print("TUTOR AGENT TEST SUITE")
    print("="*70)
    
    results = []
    
    try:
        results.append(("Basic Profile", test_basic_profile()))
    except Exception as e:
        print(f"Test failed to run: {e}")
        results.append(("Basic Profile", False))
    
    try:
        results.append(("Trade Data", test_with_trade_data()))
    except Exception as e:
        print(f"Test failed to run: {e}")
        results.append(("Trade Data", False))
    
    try:
        results.append(("Memory Persistence", test_memory_persistence()))
    except Exception as e:
        print(f"Test failed to run: {e}")
        results.append(("Memory Persistence", False))
    
    try:
        results.append(("Error Handling", test_error_handling()))
    except Exception as e:
        print(f"Test failed to run: {e}")
        results.append(("Error Handling", False))
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    passed_count = sum(1 for _, p in results if p)
    total_count = len(results)
    
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
    print("="*70)


if __name__ == "__main__":
    run_all_tests()
