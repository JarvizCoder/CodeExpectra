'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Editor from '@monaco-editor/react'

interface Question {
  id: string
  title: string
  description: string
  starter_code: string
  reference_solution: string
  language: string
  order_index: number
}

export default function DebuggingRoundPage() {
  const params = useParams()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [attempt, setAttempt] = useState<any>(null)
  const [code, setCode] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const loadRound = useCallback(async () => {
    try {
      const supabase = createClient()

      const { data: round } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', params.roundId)
        .single()

      if (!round || round.status !== 'OPEN') {
        router.push('/dashboard')
        return
      }

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

        const startedAt = new Date(existingAttempt.started_at)
        const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000)
        const totalSeconds = round.duration_minutes * 60
        setTimeLeft(Math.max(0, totalSeconds - elapsed))
      } else {
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

      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('round_id', params.roundId)
        .order('order_index', { ascending: true })

      if (questionsData) {
        setQuestions(questionsData)

        const initialCode: Record<string, string> = {}
        questionsData.forEach((q: Question) => {
          initialCode[q.id] = q.starter_code || ''
        })
        setCode(initialCode)
      }
    } catch (error) {
      console.error('Error loading round:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [params.roundId, router])

  const handleCodeChange = (questionId: string, newCode: string) => {
    setCode((prev) => ({ ...prev, [questionId]: newCode }))
  }

  const handleSubmit = useCallback(async () => {
    if (submitting || !attempt) return
    setSubmitting(true)

    try {
      for (const question of questions) {
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attempt_id: attempt.id,
            question_id: question.id,
            code: code[question.id] || question.starter_code,
            language: question.language || 'javascript',
          }),
        })
      }

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
  }, [attempt, router, questions, code])

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

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Debugging Battle</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-2 flex-wrap">
          {questions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`px-4 py-2 rounded-md ${
                currentQuestionIndex === index
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Bug {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <span className="text-sm font-medium text-indigo-600">
                Bug {currentQuestionIndex + 1}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-2">{currentQuestion.title}</h3>
              <p className="text-gray-600 mt-2 whitespace-pre-wrap">{currentQuestion.description}</p>
            </div>

            <div className="h-96 border border-gray-300 rounded-md overflow-hidden">
              <Editor
                height="384px"
                defaultLanguage={currentQuestion.language || 'javascript'}
                value={code[currentQuestion.id] || currentQuestion.starter_code}
                onChange={(value) => handleCodeChange(currentQuestion.id, value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
