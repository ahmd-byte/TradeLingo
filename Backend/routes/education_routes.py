"""
Education Pipeline API routes.

POST /api/education/start       — Phase 1: generate diagnostic quiz
POST /api/education/submit-quiz — Phase 2: submit answers → curriculum
"""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from auth.schemas import UserResponse
from auth.dependencies import get_current_active_user
from agent.education_graph import generate_quiz, generate_curriculum

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
