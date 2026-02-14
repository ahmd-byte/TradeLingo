"""
Test Suite for the SuperBear LangGraph Agent
Tests the new LangGraph-based unified AI architecture.
"""

import asyncio
import json
import sys
from datetime import datetime
from agent.graph import create_superbear_graph
from agent.state import AgentState


async def test_graph_initialization():
    """Test 1: Graph initialization and structure."""
    print("\n" + "="*60)
    print("TEST 1: Graph Initialization")
    print("="*60)
    
    try:
        graph = create_superbear_graph()
        print("✓ Graph created successfully")
        print(f"  Graph type: {type(graph)}")
        
        # Check if graph has the required methods
        if hasattr(graph, 'ainvoke'):
            print("✓ Graph has ainvoke method")
        else:
            print("✗ Graph missing ainvoke method")
            return False
            
        return True
    except Exception as e:
        print(f"✗ Error during graph initialization: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_state_creation():
    """Test 2: AgentState creation with sample data."""
    print("\n" + "="*60)
    print("TEST 2: State Creation")
    print("="*60)
    
    try:
        state = AgentState(
            user_message="What is position sizing?",
            user_id="test_user_123",
            session_id="session_456",
            timestamp=datetime.now().isoformat(),
            user_profile={
                "name": "Alice",
                "tradingLevel": "beginner",
                "learningStyle": "visual",
                "riskTolerance": "conservative"
            },
            memory_doc=None
        )
        
        print("✓ AgentState created successfully")
        print(f"  User message: {state['user_message']}")
        print(f"  User ID: {state['user_id']}")
        print(f"  Session ID: {state['session_id']}")
        
        return True
    except Exception as e:
        print(f"✗ Error during state creation: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_research_intent():
    """Test 3: Research intent detection and processing."""
    print("\n" + "="*60)
    print("TEST 3: Research Intent Flow")
    print("="*60)
    
    try:
        graph = create_superbear_graph()
        
        state = AgentState(
            user_message="How do I calculate the Sharpe ratio for my portfolio?",
            user_id="test_user_123",
            session_id="session_456",
            timestamp=datetime.now().isoformat(),
            user_profile={
                "name": "Alice",
                "tradingLevel": "intermediate",
                "learningStyle": "analytical",
                "riskTolerance": "moderate"
            },
            memory_doc={"concepts_taught": [], "emotional_patterns": []}
        )
        
        print("✓ Executing research intent flow...")
        result = await graph.ainvoke(state)
        
        print(f"  Intent detected: {result.get('intent')}")
        print(f"  Confidence: {result.get('confidence')}")
        
        if result.get('research_output'):
            print("✓ Research output generated")
            print(f"  Keys in output: {list(result['research_output'].keys())}")
        
        if result.get('final_output'):
            print("✓ Final output generated")
            output_str = json.dumps(result['final_output'], indent=2)[:200] + "..."
            print(f"  Output preview: {output_str}")
        
        return True
    except Exception as e:
        print(f"✗ Error during research flow: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_therapy_intent():
    """Test 4: Therapy intent detection and processing."""
    print("\n" + "="*60)
    print("TEST 4: Therapy Intent Flow")
    print("="*60)
    
    try:
        graph = create_superbear_graph()
        
        state = AgentState(
            user_message="I'm struggling with panic selling. Every small dip makes me want to exit my positions.",
            user_id="test_user_123",
            session_id="session_456",
            timestamp=datetime.now().isoformat(),
            user_profile={
                "name": "Bob",
                "tradingLevel": "intermediate",
                "learningStyle": "reflective",
                "riskTolerance": "low"
            },
            memory_doc={"concepts_taught": [], "emotional_patterns": []}
        )
        
        print("✓ Executing therapy intent flow...")
        result = await graph.ainvoke(state)
        
        print(f"  Intent detected: {result.get('intent')}")
        print(f"  Emotional state: {result.get('emotional_state')}")
        print(f"  Confidence: {result.get('confidence')}")
        
        if result.get('therapy_output'):
            print("✓ Therapy output generated")
            print(f"  Keys in output: {list(result['therapy_output'].keys())}")
        
        if result.get('final_output'):
            print("✓ Final output generated")
        
        return True
    except Exception as e:
        print(f"✗ Error during therapy flow: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_combined_intent():
    """Test 5: Combined research + therapy intent."""
    print("\n" + "="*60)
    print("TEST 5: Combined Intent Flow (Research + Therapy)")
    print("="*60)
    
    try:
        graph = create_superbear_graph()
        
        state = AgentState(
            user_message="I'm nervous about making my first options trade but want to understand the mechanics better.",
            user_id="test_user_123",
            session_id="session_456",
            timestamp=datetime.now().isoformat(),
            user_profile={
                "name": "Charlie",
                "tradingLevel": "beginner",
                "learningStyle": "analytical",
                "riskTolerance": "conservative"
            },
            memory_doc={"concepts_taught": [], "emotional_patterns": []}
        )
        
        print("✓ Executing combined intent flow...")
        result = await graph.ainvoke(state)
        
        print(f"  Intent detected: {result.get('intent')}")
        print(f"  Emotional state: {result.get('emotional_state')}")
        print(f"  Confidence: {result.get('confidence')}")
        
        if result.get('research_output'):
            print("✓ Research component generated")
            
        if result.get('therapy_output'):
            print("✓ Therapy component generated")
        
        if result.get('final_output'):
            print("✓ Merged output generated successfully")
        
        return True
    except Exception as e:
        print(f"✗ Error during combined flow: {e}")
        import traceback
        traceback.print_exc()
        return False


async def run_all_tests():
    """Run all tests asynchronously."""
    print("\n" + "="*70)
    print("SUPERBEAR LANGGRAPH TEST SUITE")
    print("="*70)
    
    results = []
    
    # Test 1: Initialization
    try:
        passed = await test_graph_initialization()
        results.append(("Graph Initialization", passed))
    except Exception as e:
        print(f"Test failed to run: {e}")
        results.append(("Graph Initialization", False))
    
    # Test 2: State Creation
    try:
        passed = await test_state_creation()
        results.append(("State Creation", passed))
    except Exception as e:
        print(f"Test failed to run: {e}")
        results.append(("State Creation", False))
    
    # Test 3: Research Intent
    try:
        passed = await test_research_intent()
        results.append(("Research Intent Flow", passed))
    except Exception as e:
        print(f"Test failed to run: {e}")
        results.append(("Research Intent Flow", False))
    
    # Test 4: Therapy Intent
    try:
        passed = await test_therapy_intent()
        results.append(("Therapy Intent Flow", passed))
    except Exception as e:
        print(f"Test failed to run: {e}")
        results.append(("Therapy Intent Flow", False))
    
    # Test 5: Combined Intent
    try:
        passed = await test_combined_intent()
        results.append(("Combined Intent Flow", passed))
    except Exception as e:
        print(f"Test failed to run: {e}")
        results.append(("Combined Intent Flow", False))
    
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
    
    return all(p for _, p in results)


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
