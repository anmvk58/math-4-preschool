from fastapi.testclient import TestClient

from app.main import app


def test_generate_hides_answer_and_answer_flow():
    client = TestClient(app)
    generated = client.post(
        "/api/exercises/generate",
        json={"questionCount": 3, "maxNumber": 10, "operations": ["ADD"]},
    )
    assert generated.status_code == 201
    body = generated.json()
    assert "answer" not in body["questions"][0]
    response = client.post(
        f"/api/exercises/{body['exerciseId']}/answer",
        json={"questionId": 1, "answer": -999},
    )
    assert response.json() == {"correct": False}
