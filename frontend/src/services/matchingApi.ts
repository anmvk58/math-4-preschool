import type { MatchingGame } from '../types/matchingGame'

const baseUrl = import.meta.env.VITE_API_URL || '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {headers:{'Content-Type':'application/json'}, ...options})
  if (!response.ok) throw new Error('Không thể kết nối. Hãy thử lại nhé!')
  return response.json()
}

export const matchingApi = {
  generate: (roundCount: number, maxNumber: number) =>
    request<MatchingGame>('/matching/generate', {method:'POST', body:JSON.stringify({roundCount,maxNumber})}),
  answer: (gameId: string, roundId: number, itemId: string, answer: number) =>
    request<{correct:boolean;solvedCount:number}>(`/matching/${gameId}/answer`, {
      method:'POST', body:JSON.stringify({roundId,itemId,answer}),
    }),
}
