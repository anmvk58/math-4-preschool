from enum import Enum
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field, model_validator


class Operation(str, Enum):
    ADD = "ADD"
    SUBTRACT = "SUBTRACT"
    MULTIPLY = "MULTIPLY"
    DIVIDE = "DIVIDE"


class ExerciseCreate(BaseModel):
    question_count: int = Field(10, alias="questionCount", ge=1, le=50)
    max_number: int = Field(10, alias="maxNumber", ge=1, le=1000)
    operations: list[Operation] = Field(min_length=1)

    model_config = {"populate_by_name": True}

    @model_validator(mode="after")
    def unique_operations(self):
        self.operations = list(dict.fromkeys(self.operations))
        return self


class QuestionPublic(BaseModel):
    id: int
    type: Literal["ARITHMETIC"] = "ARITHMETIC"
    operand1: int
    operand2: int
    operation: Operation
    display: str


class QuestionInternal(QuestionPublic):
    answer: int


class ExercisePublic(BaseModel):
    exercise_id: str = Field(alias="exerciseId")
    questions: list[QuestionPublic]
    model_config = {"populate_by_name": True}


class ExerciseInternal(BaseModel):
    exercise_id: str = Field(default_factory=lambda: str(uuid4()), alias="exerciseId")
    questions: list[QuestionInternal]
    attempts: dict[int, int] = Field(default_factory=dict)
    solved: set[int] = Field(default_factory=set)
    model_config = {"populate_by_name": True}

    def to_public(self) -> ExercisePublic:
        return ExercisePublic(
            exerciseId=self.exercise_id,
            questions=[QuestionPublic(**q.model_dump()) for q in self.questions],
        )


class AnswerRequest(BaseModel):
    question_id: int = Field(alias="questionId", ge=1)
    answer: int
    model_config = {"populate_by_name": True}


class AnswerResponse(BaseModel):
    correct: bool


class ReviewItem(BaseModel):
    question_id: int = Field(alias="questionId")
    display: str
    answer_given: int | None = Field(alias="answerGiven")
    correct_answer: int = Field(alias="correctAnswer")
    correct: bool
    model_config = {"populate_by_name": True}


class ExerciseResult(BaseModel):
    total: int
    correct_count: int = Field(alias="correctCount")
    completed: bool
    review: list[ReviewItem]
    model_config = {"populate_by_name": True}
