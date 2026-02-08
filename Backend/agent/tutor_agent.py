"""
Tutor Agent Module
Implements the single educational AI Trading Tutor Agent.
Follows the decision loop: Observe → Analyze → Decide → Teach
"""

from services.llm_service import LLMService
from prompts.tutor_prompt import (
    build_tutor_prompt,
    build_observation_context,
    build_analysis_context,
    build_memory_summary
)
from memory.learning_memory import LearningMemory, update_memory


class TutorAgent:
    """
    Single Educational AI Trading Tutor Agent.
    
    Implements a structured decision loop:
    - OBSERVE: Understand the current situation
    - ANALYZE: Identify patterns and learning opportunities
    - DECIDE: Choose one concept to teach
    - TEACH: Generate structured educational content
    """
    
    def __init__(self, memory=None):
        """
        Initialize the tutor agent.
        
        Args:
            memory (LearningMemory): Optional existing memory. Creates new if not provided.
        """
        self.llm = LLMService()
        self.memory = memory or LearningMemory()
        self.last_response = None
    
    def run_agent(self, user_profile, trade_data=None, user_question=None):
        """
        Run the complete agent loop.
        
        Main entry point for the agent. Processes user input and returns structured
        educational content.
        
        Args:
            user_profile (dict): User profile with trading level, learning style, etc.
            trade_data (dict): Optional trade information
            user_question (str): Optional user question or context
        
        Returns:
            dict: Structured response with observation, analysis, learning concept, and teaching
        """
        # Step 1: OBSERVE
        observation = self.observe(trade_data, user_question)
        
        # Step 2: ANALYZE
        analysis = self.analyze(observation, trade_data)
        
        # Step 3: DECIDE (happens within the LLM call with full context)
        
        # Step 4: TEACH (and all of the above, structured)
        response = self.teach(user_profile, observation, analysis)
        
        # Store the response
        self.last_response = response
        
        # Update memory with what was taught
        self._update_memory_from_response(response)
        
        return response
    
    def observe(self, trade_data=None, user_question=None):
        """
        OBSERVE Step: Understand the current situation.
        
        Gathers information about the user's current context (trade, question, etc.)
        without judgment.
        
        Args:
            trade_data (dict): Trade information if available
            user_question (str): User's question if provided
        
        Returns:
            dict: Observation context
        """
        observation = build_observation_context(
            trade_data=trade_data,
            user_question=user_question
        )
        
        # Could add more sophisticated observation logic here
        # For now, simple structured gathering
        
        return observation
    
    def analyze(self, observation, trade_data=None):
        """
        ANALYZE Step: Identify patterns, gaps, and opportunities.
        
        Reviews memory to identify what has been taught, what mistakes observed,
        and what should be focused on next.
        
        Args:
            observation (dict): Current observation
            trade_data (dict): Trade data if available
        
        Returns:
            dict: Analysis context with mistakes, focus areas, etc.
        """
        past_mistakes = self.memory.get_recent_mistakes(limit=5)
        recent_trades = self.memory.get_recent_trades(limit=3)
        focus_areas = self.memory.get_focus_areas()
        
        analysis = build_analysis_context(
            past_mistakes=past_mistakes,
            recent_trades=recent_trades,
            focus_areas=focus_areas
        )
        
        return analysis
    
    def teach(self, user_profile, observation, analysis):
        """
        TEACH Step: Generate structured educational content.
        
        Uses the LLM to produce a complete, structured teaching response that includes
        the observation, analysis, decision (what concept), and the actual teaching.
        
        Args:
            user_profile (dict): User profile
            observation (dict): Observation from step 1
            analysis (dict): Analysis from step 2
        
        Returns:
            dict: Structured response from LLM with all fields
        """
        memory_summary = build_memory_summary(self.memory)
        
        prompt = build_tutor_prompt(
            profile=user_profile,
            observation=observation,
            analysis_input=analysis,
            memory_summary=memory_summary
        )
        
        # Call LLM and get structured JSON response
        response = self.llm.call_gemini_json(prompt)
        
        return response
    
    def _update_memory_from_response(self, response):
        """
        Update memory based on what was taught in this interaction.
        
        Args:
            response (dict): The structured response from the teach step
        """
        if not response:
            return
        
        # Record the concept that was taught
        concept_name = response.get("learning_concept", "Unknown Concept")
        explanation = response.get("teaching_explanation", "")
        
        update_memory(self.memory, "concept_taught", {
            "concept": concept_name,
            "explanation": explanation
        })
    
    def get_memory(self):
        """
        Get the current memory state.
        
        Returns:
            LearningMemory: The agent's learning memory
        """
        return self.memory
    
    def set_memory(self, memory):
        """
        Set the agent's memory (useful for restoring from session).
        
        Args:
            memory (LearningMemory): Memory to set
        """
        self.memory = memory


def run_agent(input_data, memory=None):
    """
    Convenience function to run the agent.
    
    Args:
        input_data (dict): Input data with keys: user_profile, trade_data (optional), user_question (optional)
        memory (LearningMemory): Optional existing memory
    
    Returns:
        dict: Structured response from the agent
    """
    agent = TutorAgent(memory=memory)
    
    response = agent.run_agent(
        user_profile=input_data.get("user_profile"),
        trade_data=input_data.get("trade_data"),
        user_question=input_data.get("user_question")
    )
    
    return response, agent.get_memory()
