import random
from threading import Lock

from app.schemas.matching_game import (
    MatchingAnswerResponse,
    MatchingGameCreate,
    MatchingGameInternal,
    MatchingItem,
    MatchingRound,
)


THEMES = [
    ("Vườn trái cây", ["🍎", "🍓", "🍊"]),
    ("Bạn nhỏ đại dương", ["🐟", "🐠", "🐙"]),
    ("Bầu trời vui vẻ", ["⭐", "🌈", "🚀"]),
    ("Khu vườn tí hon", ["🌼", "🦋", "🐞"]),
    ("Hộp đồ chơi", ["⚽", "🚗", "🧸"]),
]


class MatchingGameService:
    def __init__(self) -> None:
        self._games: dict[str, MatchingGameInternal] = {}
        self._lock = Lock()

    def generate(self, payload: MatchingGameCreate) -> MatchingGameInternal:
        rounds: list[MatchingRound] = []
        for round_index in range(payload.round_count):
            theme, emojis = THEMES[round_index % len(THEMES)]
            quantities = random.sample(range(1, payload.max_number + 1), 3)
            items = [
                MatchingItem(id=f"{round_index + 1}-{index + 1}", emoji=emoji, quantity=quantity)
                for index, (emoji, quantity) in enumerate(zip(emojis, quantities))
            ]
            numbers = quantities.copy()
            random.shuffle(numbers)
            rounds.append(MatchingRound(id=round_index + 1, theme=theme, items=items, numbers=numbers))

        game = MatchingGameInternal(rounds=rounds)
        with self._lock:
            self._games[game.game_id] = game
        return game

    def answer(self, game_id: str, round_id: int, item_id: str, answer: int) -> MatchingAnswerResponse:
        with self._lock:
            game = self._games.get(game_id)
            if game is None:
                raise KeyError("Không tìm thấy trò chơi")
            round_data = next((round_item for round_item in game.rounds if round_item.id == round_id), None)
            if round_data is None:
                raise KeyError("Không tìm thấy màn chơi")
            item = next((entry for entry in round_data.items if entry.id == item_id), None)
            if item is None:
                raise KeyError("Không tìm thấy nhóm hình")
            correct = item.quantity == answer
            if correct:
                game.solved.add(item_id)
            return MatchingAnswerResponse(correct=correct, solvedCount=len(game.solved))
