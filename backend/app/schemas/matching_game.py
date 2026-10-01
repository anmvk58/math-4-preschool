from uuid import uuid4

from pydantic import BaseModel, Field


class MatchingGameCreate(BaseModel):
    round_count: int = Field(5, alias="roundCount", ge=1, le=10)
    max_number: int = Field(10, alias="maxNumber", ge=3, le=20)
    model_config = {"populate_by_name": True}


class MatchingItem(BaseModel):
    id: str
    emoji: str
    quantity: int


class MatchingRound(BaseModel):
    id: int
    theme: str
    items: list[MatchingItem]
    numbers: list[int]


class MatchingGamePublic(BaseModel):
    game_id: str = Field(alias="gameId")
    rounds: list[MatchingRound]
    model_config = {"populate_by_name": True}


class MatchingGameInternal(MatchingGamePublic):
    game_id: str = Field(default_factory=lambda: str(uuid4()), alias="gameId")
    solved: set[str] = Field(default_factory=set)

    def to_public(self) -> MatchingGamePublic:
        return MatchingGamePublic(gameId=self.game_id, rounds=self.rounds)


class MatchingAnswerRequest(BaseModel):
    round_id: int = Field(alias="roundId", ge=1)
    item_id: str = Field(alias="itemId", min_length=1)
    answer: int = Field(ge=1)
    model_config = {"populate_by_name": True}


class MatchingAnswerResponse(BaseModel):
    correct: bool
    solved_count: int = Field(alias="solvedCount")
    model_config = {"populate_by_name": True}
