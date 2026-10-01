from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.exercises import router as exercises_router
from app.api.matching_game import router as matching_router

app = FastAPI(title="Kids Math API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(exercises_router, prefix="/api/exercises", tags=["exercises"])
app.include_router(matching_router, prefix="/api/matching", tags=["matching-game"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
