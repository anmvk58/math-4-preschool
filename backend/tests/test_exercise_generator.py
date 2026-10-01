import random

import pytest

from app.schemas.exercise import ExerciseCreate, Operation
from app.services.exercise_generator import ExerciseGenerator


@pytest.mark.parametrize("operation", list(Operation))
def test_operation_rules(operation: Operation):
    maximum = 20
    exercise = ExerciseGenerator(random.Random(42)).generate(
        ExerciseCreate(questionCount=100 if False else 50, maxNumber=maximum, operations=[operation])
    )
    for q in exercise.questions:
        assert 0 <= q.operand1 <= maximum
        assert 0 <= q.operand2 <= maximum
        assert 0 <= q.answer <= maximum
        if operation == Operation.SUBTRACT:
            assert q.operand1 >= q.operand2
        if operation == Operation.DIVIDE:
            assert q.operand2 != 0
            assert q.operand1 / q.operand2 == q.answer


def test_mixed_operations_has_requested_count():
    config = ExerciseCreate(questionCount=37, maxNumber=10, operations=list(Operation))
    exercise = ExerciseGenerator(random.Random(7)).generate(config)
    assert len(exercise.questions) == 37
    assert {q.operation for q in exercise.questions}.issubset(set(Operation))
