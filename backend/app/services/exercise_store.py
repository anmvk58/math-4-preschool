from threading import Lock

from app.schemas.exercise import AnswerResponse, ExerciseInternal, ExerciseResult, ReviewItem


class ExerciseStore:
    """Small in-memory repository that can later be replaced by a database repository."""

    def __init__(self) -> None:
        self._items: dict[str, ExerciseInternal] = {}
        self._lock = Lock()

    def save(self, exercise: ExerciseInternal) -> None:
        with self._lock:
            self._items[exercise.exercise_id] = exercise

    def _get(self, exercise_id: str) -> ExerciseInternal:
        if exercise_id not in self._items:
            raise KeyError("Không tìm thấy bộ đề")
        return self._items[exercise_id]

    def answer(self, exercise_id: str, question_id: int, answer: int) -> AnswerResponse:
        with self._lock:
            exercise = self._get(exercise_id)
            question = next((q for q in exercise.questions if q.id == question_id), None)
            if question is None:
                raise KeyError("Không tìm thấy câu hỏi")
            exercise.attempts[question_id] = answer
            correct = answer == question.answer
            if correct:
                exercise.solved.add(question_id)
            return AnswerResponse(correct=correct)

    def result(self, exercise_id: str) -> ExerciseResult:
        exercise = self._get(exercise_id)
        return ExerciseResult(
            total=len(exercise.questions),
            correctCount=len(exercise.solved),
            completed=len(exercise.solved) == len(exercise.questions),
            review=[
                ReviewItem(
                    questionId=q.id,
                    display=q.display.replace(" = ?", ""),
                    answerGiven=exercise.attempts.get(q.id),
                    correctAnswer=q.answer,
                    correct=q.id in exercise.solved,
                )
                for q in exercise.questions
            ],
        )
