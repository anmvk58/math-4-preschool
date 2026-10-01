from fastapi import APIRouter, HTTPException, status

from app.schemas.matching_game import (
    MatchingAnswerRequest,
    MatchingAnswerResponse,
    MatchingGameCreate,
    MatchingGamePublic,
)
from app.services.matching_game import MatchingGameService

router = APIRouter()
service = MatchingGameService()


@router.post("/generate", response_model=MatchingGamePublic, status_code=status.HTTP_201_CREATED)
def generate_game(payload: MatchingGameCreate) -> MatchingGamePublic:
    return service.generate(payload).to_public()


@router.post("/{game_id}/answer", response_model=MatchingAnswerResponse)
def answer_match(game_id: str, payload: MatchingAnswerRequest) -> MatchingAnswerResponse:
    try:
        return service.answer(game_id, payload.round_id, payload.item_id, payload.answer)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
