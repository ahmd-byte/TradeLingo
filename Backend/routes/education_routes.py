"""
Education Pipeline API routes.

POST /api/education/start       — Phase 1: generate diagnostic quiz
POST /api/education/submit-quiz — Phase 2: submit answers → curriculum
GET  /api/education/progress    — Get user's learning progress
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from auth.schemas import UserResponse
from auth.dependencies import get_current_active_user
from agent.education_graph import generate_quiz, generate_curriculum
from services import progress_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/education", tags=["education"])


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------
class StartEducationResponse(BaseModel):
    """Response for Phase 1 — contains quiz questions."""
    quiz_questions: list = Field(..., description="List of diagnostic quiz questions")
    profile: dict = Field(..., description="User profile snapshot used for generation")
    trade_type: str | None = Field(None, description="Derived trade type")


class SubmitQuizRequest(BaseModel):
    """Request body for Phase 2."""
    quiz_questions: list = Field(..., min_length=1, description="Original quiz questions from Phase 1")
    quiz_answers: List[str] = Field(..., min_length=1, description="User's answers to each question")


class SubmitQuizResponse(BaseModel):
    """Response for Phase 2 — contains gaps and curriculum."""
    knowledge_gaps: dict = Field(..., description="Identified knowledge gaps")
    curriculum: dict = Field(..., description="Generated curriculum / lesson plan")


# ---------------------------------------------------------------------------
# POST /api/education/start
# ---------------------------------------------------------------------------
@router.post("/start", response_model=StartEducationResponse)
async def start_education(
    current_user: UserResponse = Depends(get_current_active_user),
):
    """
    Phase 1 — Load user profile and generate a 5-question diagnostic quiz.
    The user_id is extracted from the JWT token automatically.
    """
    try:
        result = await generate_quiz(user_id=current_user.id)

        return StartEducationResponse(
            quiz_questions=result.get("quiz_questions", []),
            profile=result.get("profile", {}),
            trade_type=result.get("trade_type"),
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Education start error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while generating quiz",
        )


# ---------------------------------------------------------------------------
# POST /api/education/submit-quiz
# ---------------------------------------------------------------------------
@router.post("/submit-quiz", response_model=SubmitQuizResponse)
async def submit_quiz(
    request: SubmitQuizRequest,
    current_user: UserResponse = Depends(get_current_active_user),
):
    """
    Phase 2 — Accept quiz answers, analyse knowledge gaps, generate and
    persist a personalised curriculum.
    """
    # Validate answer count matches question count
    if len(request.quiz_answers) != len(request.quiz_questions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Expected {len(request.quiz_questions)} answers, "
                f"got {len(request.quiz_answers)}"
            ),
        )

    try:
        # We need the profile and trade_type – re-derive from user doc
        # (avoids trusting client-side state)
        phase1_stub = await generate_quiz(user_id=current_user.id)
        profile = phase1_stub.get("profile", {})
        trade_type = phase1_stub.get("trade_type")

        result = await generate_curriculum(
            user_id=current_user.id,
            quiz_questions=request.quiz_questions,
            quiz_answers=request.quiz_answers,
            profile=profile,
            trade_type=trade_type,
        )

        return SubmitQuizResponse(
            knowledge_gaps=result.get("knowledge_gaps", {}),
            curriculum=result.get("curriculum", {}),
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Education submit-quiz error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while generating curriculum",
        )


# ---------------------------------------------------------------------------
# Progress response schemas
# ---------------------------------------------------------------------------
class ModuleProgress(BaseModel):
    """Progress details for a single module."""
    index: int = Field(..., description="Module index in curriculum")
    topic: str = Field(..., description="Module topic")
    difficulty: str = Field(..., description="Module difficulty level")
    status: str = Field(..., description="locked | current | completed")
    mastery_score: int = Field(..., description="Mastery score 0-100")
    interaction_count: int = Field(..., description="Number of interactions")
    estimated_duration: str = Field(..., description="Estimated duration")


class ProgressResponse(BaseModel):
    """Response for GET /api/education/progress."""
    has_lesson_plan: bool = Field(..., description="Whether user has a lesson plan")
    learning_objective: Optional[str] = Field(None, description="Overall learning objective")
    current_module: Optional[ModuleProgress] = Field(None, description="Current module details")
    completed_modules: List[ModuleProgress] = Field(default=[], description="Completed modules")
    remaining_modules: List[ModuleProgress] = Field(default=[], description="Locked/remaining modules")
    progress_percentage: float = Field(..., description="Overall progress percentage")
    total_modules: int = Field(..., description="Total number of modules")
    progression_strategy: Optional[str] = Field(None, description="How modules build on each other")


# ---------------------------------------------------------------------------
# GET /api/education/progress
# ---------------------------------------------------------------------------
@router.get("/progress", response_model=ProgressResponse)
async def get_progress(
    current_user: UserResponse = Depends(get_current_active_user),
):
    """
    Get the user's learning progress across all modules.
    
    Returns:
    - Overall learning objective
    - Current module being studied
    - List of completed modules
    - List of remaining/locked modules
    - Progress percentage (completed / total * 100)
    """
    try:
        progress = await progress_service.get_progress_summary(user_id=current_user.id)
        
        # Convert module dicts to ModuleProgress models
        def to_module_progress(m: dict) -> ModuleProgress:
            return ModuleProgress(
                index=m.get("index", 0),
                topic=m.get("topic", "Unknown"),
                difficulty=m.get("difficulty", "beginner"),
                status=m.get("status", "locked"),
                mastery_score=m.get("mastery_score", 0),
                interaction_count=m.get("interaction_count", 0),
                estimated_duration=m.get("estimated_duration", "N/A"),
            )
        
        current_module = None
        if progress.get("current_module"):
            current_module = to_module_progress(progress["current_module"])
        
        completed_modules = [
            to_module_progress(m) for m in progress.get("completed_modules", [])
        ]
        
        remaining_modules = [
            to_module_progress(m) for m in progress.get("remaining_modules", [])
        ]
        
        return ProgressResponse(
            has_lesson_plan=progress.get("has_lesson_plan", False),
            learning_objective=progress.get("learning_objective"),
            current_module=current_module,
            completed_modules=completed_modules,
            remaining_modules=remaining_modules,
            progress_percentage=progress.get("progress_percentage", 0),
            total_modules=progress.get("total_modules", 0),
            progression_strategy=progress.get("progression_strategy"),
        )
    
    except Exception as e:
        logger.error(f"Education progress error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching progress",
        )
