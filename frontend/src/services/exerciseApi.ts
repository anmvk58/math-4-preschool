import type { Exercise, Operation, Result } from '../types/exercise'

const baseUrl = import.meta.env.VITE_API_URL || '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { headers: {'Content-Type':'application/json'}, ...options })
  if (!response.ok) throw new Error('Không thể kết nối. Hãy thử lại nhé!')
  return response.json()
}

export const exerciseApi = {
  generate: (questionCount: number, maxNumber: number, operations: Operation[]) =>
    request<Exercise>('/exercises/generate', {method:'POST', body:JSON.stringify({questionCount,maxNumber,operations})}),
  answer: (exerciseId: string, questionId: number, answer: number) =>
    request<{correct:boolean}>(`/exercises/${exerciseId}/answer`, {method:'POST', body:JSON.stringify({questionId,answer})}),
  result: (exerciseId: string) => request<Result>(`/exercises/${exerciseId}/result`),
}
