export interface MatchingItem {
  id: string
  emoji: string
  quantity: number
}

export interface MatchingRound {
  id: number
  theme: string
  items: MatchingItem[]
  numbers: number[]
}

export interface MatchingGame {
  gameId: string
  rounds: MatchingRound[]
}
