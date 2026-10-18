'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

interface Question {
  id: string
  title: string
  description: string
  order_index: number
  question_options: Array<{
    id: string
    option_text: string
    order_index: number
  }>
}

export default function QuizRoundPage() {
  const params = useParams()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [attempt, setAttempt] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadRound = useCallback(async () => {
    try {
      const supabase = createClient()

      // Get round info
      const { data: round } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', params.roundId)
        .single()

      if (!round || round.status !== 'OPEN') {
        router.push('/dashboard')
        return
      }

      // Get or create attempt
      const { data: existingAttempt } = await supabase
        .from('round_attempts')
        .select('*')
        .eq('round_id', params.roundId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      let currentAttempt = existingAttempt

      if (existingAttempt) {
        setAttempt(existingAttempt)
        if (existingAttempt.status === 'SUBMITTED') {
          router.push('/dashboard')
          return
        }

        // Calculate time left
        const startedAt = new Date(existingAttempt.started_at)
        const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000)
        const totalSeconds = round.duration_minutes * 60
        setTimeLeft(Math.max(0, totalSeconds - elapsed))
      } else {
        // Create new attempt
        const response = await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            round_id: params.roundId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Failed to start attempt:', errorData)

          // If attempt already exists, try to fetch it again
          if (errorData.error === 'Attempt already exists') {
            const { data: retryAttempt } = await supabase
              .from('round_attempts')
              .select('*')
              .eq('round_id', params.roundId)
              .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
              .single()

            if (retryAttempt) {
              setAttempt(retryAttempt)
              if (retryAttempt.status === 'SUBMITTED') {
                router.push('/dashboard')
                return
              }
              const startedAt = new Date(retryAttempt.started_at)
              const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000)
              const totalSeconds = round.duration_minutes * 60
              setTimeLeft(Math.max(0, totalSeconds - elapsed))
              currentAttempt = retryAttempt
            } else {
              throw new Error(errorData.error || 'Failed to start attempt')
            }
          } else {
            throw new Error(errorData.error || 'Failed to start attempt')
          }
        } else {
          const createdAttempt = await response.json()
          setAttempt(createdAttempt)
          currentAttempt = createdAttempt
          setTimeLeft(round.duration_minutes * 60)
        }
      }

      // Get questions
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*, question_options(*)')
        .eq('round_id', params.roundId)
        .order('order_index', { ascending: true })

      if (questionsData) {
        setQuestions(questionsData)

        // Load saved answers
        const { data: savedAnswers } = await supabase
          .from('saved_answers')
          .select('*')
          .eq('attempt_id', currentAttempt?.id)

        if (savedAnswers) {
          const answersMap: Record<string, string> = {}
          savedAnswers.forEach((sa: any) => {
            if (sa.option_id) {
              answersMap[sa.question_id] = sa.option_id
            }
          })
          setAnswers(answersMap)
        }
      }
    } catch (error) {
      console.error('Error loading round:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [params.roundId, router])

  const handleAnswerChange = async (questionId: string, optionId: string | null) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId || '' }))

    try {
      await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attempt.id,
          question_id: questionId,
          option_id: optionId,
        }),
      })
    } catch (error) {
      console.error('Error saving answer:', error)
    }
  }

  const handleSubmit = useCallback(async () => {
    if (submitting || !attempt) return
    setSubmitting(true)

    try {
      await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          attempt_id: attempt.id,
        }),
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting:', error)
      setSubmitting(false)
    }
  }, [attempt, router])

  useEffect(() => {
    loadRound()
  }, [loadRound])

  useEffect(() => {
    if (timeLeft > 0 && attempt?.status === 'IN_PROGRESS') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft, attempt?.status, handleSubmit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Quiz Battle</h1>
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-mono ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <span className="text-sm font-medium text-indigo-600">
                  Question {index + 1}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">{question.title}</h3>
                <p className="text-gray-600 mt-2">{question.description}</p>
              </div>

              <div className="space-y-3">
                {question.question_options.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answers[question.id] === option.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={(e) =>
                        handleAnswerChange(question.id, e.target.value)
                      }
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option.option_text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
