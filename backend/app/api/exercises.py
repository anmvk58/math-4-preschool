from fastapi import APIRouter, HTTPException, status

from app.schemas.exercise import (
    AnswerRequest,
    AnswerResponse,
    ExerciseCreate,
    ExercisePublic,
    ExerciseResult,
)
from app.services.exercise_generator import ExerciseGenerator
from app.services.exercise_store import ExerciseStore

router = APIRouter()
generator = ExerciseGenerator()
store = ExerciseStore()


@router.post("/generate", response_model=ExercisePublic, status_code=status.HTTP_201_CREATED)
def generate_exercise(payload: ExerciseCreate) -> ExercisePublic:
    exercise = generator.generate(payload)
    store.save(exercise)
    return exercise.to_public()


@router.post("/{exercise_id}/answer", response_model=AnswerResponse)
def answer_question(exercise_id: str, payload: AnswerRequest) -> AnswerResponse:
    try:
        return store.answer(exercise_id, payload.question_id, payload.answer)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{exercise_id}/result", response_model=ExerciseResult)
def exercise_result(exercise_id: str) -> ExerciseResult:
    try:
        return store.result(exercise_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
