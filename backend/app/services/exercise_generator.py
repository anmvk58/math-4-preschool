import random

from app.schemas.exercise import ExerciseCreate, ExerciseInternal, Operation, QuestionInternal

SYMBOLS = {
    Operation.ADD: "+",
    Operation.SUBTRACT: "−",
    Operation.MULTIPLY: "×",
    Operation.DIVIDE: "÷",
}


class ExerciseGenerator:
    def __init__(self, rng: random.Random | None = None) -> None:
        self.rng = rng or random.Random()

    def generate(self, config: ExerciseCreate) -> ExerciseInternal:
        questions = []
        for index in range(1, config.question_count + 1):
            operation = self.rng.choice(config.operations)
            a, b, answer = self._operands(operation, config.max_number)
            questions.append(
                QuestionInternal(
                    id=index,
                    operand1=a,
                    operand2=b,
                    operation=operation,
                    display=f"{a} {SYMBOLS[operation]} {b} = ?",
                    answer=answer,
                )
            )
        return ExerciseInternal(questions=questions)

    def _operands(self, operation: Operation, maximum: int) -> tuple[int, int, int]:
        if operation == Operation.ADD:
            answer = self.rng.randint(0, maximum)
            a = self.rng.randint(0, answer)
            return a, answer - a, answer
        if operation == Operation.SUBTRACT:
            a = self.rng.randint(0, maximum)
            b = self.rng.randint(0, a)
            return a, b, a - b
        if operation == Operation.MULTIPLY:
            a = self.rng.randint(0, min(maximum, 10))
            max_b = min(10, maximum // a) if a else min(10, maximum)
            b = self.rng.randint(0, max_b)
            return a, b, a * b
        # Build division from quotient × divisor so it is always exact.
        divisor = self.rng.randint(1, min(maximum, 10))
        quotient = self.rng.randint(0, min(10, maximum // divisor))
        dividend = divisor * quotient
        return dividend, divisor, quotient
