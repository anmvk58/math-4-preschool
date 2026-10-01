export type Operation = 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE'
export type QuestionStatus = 'UNANSWERED' | 'CORRECT' | 'INCORRECT'

export interface Question {
  id: number; type: 'ARITHMETIC'; operand1: number; operand2: number
  operation: Operation; display: string
}
export interface Exercise { exerciseId: string; questions: Question[] }
export interface ReviewItem {
  questionId: number; display: string; answerGiven: number | null
  correctAnswer: number; correct: boolean
}
export interface Result { total: number; correctCount: number; completed: boolean; review: ReviewItem[] }
