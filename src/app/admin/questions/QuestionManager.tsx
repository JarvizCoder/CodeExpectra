'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Question {
  id: string
  title: string
  description: string
  type: string
  difficulty: string
  points: number
  order_index: number
  rounds: { name: string }
  question_options: Array<{ id: string; option_text: string; is_correct: boolean }>
}

interface Round {
  id: string
  name: string
  type: string
}

interface QuestionManagerProps {
  rounds: Round[]
  questions: Question[]
}

export default function QuestionManager({ rounds, questions }: QuestionManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAIForm, setShowAIForm] = useState(false)
  const [selectedRound, setSelectedRound] = useState('')
  const [selectedType, setSelectedType] = useState('QUIZ')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('EASY')
  const [points, setPoints] = useState(10)
  const [options, setOptions] = useState([
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ])

  // AI Generation state
  const [aiSource, setAiSource] = useState<'document' | 'youtube'>('document')
  const [aiContent, setAiContent] = useState('')
  const [aiRoundId, setAiRoundId] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const handleAddOption = () => {
    setOptions([...options, { text: '', is_correct: false }])
  }

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options]
    newOptions[index].text = text
    setOptions(newOptions)
  }

  const handleCorrectToggle = (index: number) => {
    const newOptions = [...options]
    newOptions[index].is_correct = !newOptions[index].is_correct
    setOptions(newOptions)
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRound || !title || !description) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // Create question
      const questionRes = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          round_id: selectedRound,
          type: selectedType,
          title,
          description,
          difficulty,
          points,
          order_index: questions.filter(q => q.rounds?.name === rounds.find(r => r.id === selectedRound)?.name).length + 1,
        }),
      })

      if (!questionRes.ok) throw new Error('Failed to create question')

      const questionData = await questionRes.json()

      // Create options for quiz questions
      if (selectedType === 'QUIZ') {
        for (const option of options) {
          if (option.text) {
            await fetch('/api/admin/question-options', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                question_id: questionData.id,
                option_text: option.text,
                is_correct: option.is_correct,
                order_index: options.indexOf(option),
              }),
            })
          }
        }
      }

      // Reset form
      setTitle('')
      setDescription('')
      setPoints(10)
      setOptions([
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ])
      setShowAddForm(false)
      window.location.reload()
    } catch (error) {
      console.error('Error creating question:', error)
      alert('Failed to create question')
    }
  }

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault()
    setAiLoading(true)
    setAiError('')

    try {
      const res = await fetch('/api/admin/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: aiSource,
          content: aiContent,
          round_id: aiRoundId,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate questions')
      }

      const data = await res.json()
      alert(`Successfully generated ${data.questions?.length || 0} questions!`)
      setAiContent('')
      setShowAIForm(false)
      window.location.reload()
    } catch (error: any) {
      setAiError(error.message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      await fetch(`/api/admin/questions?id=${questionId}`, {
        method: 'DELETE',
      })
      window.location.reload()
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-purple-600">Question Manager</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-indigo-600 hover:text-indigo-700"
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showAddForm ? 'Cancel' : '+ Add Question Manually'}
          </button>
          <button
            onClick={() => setShowAIForm(!showAIForm)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            {showAIForm ? 'Cancel' : '✨ AI Generate Questions'}
          </button>
        </div>

        {/* Manual Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Question Manually</h2>
            <form onSubmit={handleSubmitQuestion}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
                  <select
                    value={selectedRound}
                    onChange={(e) => setSelectedRound(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Round</option>
                    {rounds.map((round) => (
                      <option key={round.id} value={round.id}>
                        {round.name} ({round.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="QUIZ">Quiz</option>
                    <option value="CODING">Coding</option>
                    <option value="DEBUGGING">Debugging</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                  />
                </div>
              </div>

              {selectedType === 'QUIZ' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer">
                        <input
                          type="checkbox"
                          checked={option.is_correct}
                          onChange={() => handleCorrectToggle(index)}
                        />
                        Correct
                      </label>
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    + Add Option
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create Question
              </button>
            </form>
          </div>
        )}

        {/* AI Generation Form */}
        {showAIForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">✨ AI Generate Questions</h2>
            <form onSubmit={handleGenerateQuestions}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
                <select
                  value={aiSource}
                  onChange={(e) => setAiSource(e.target.value as 'document' | 'youtube')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="document">Document/Text</option>
                  <option value="youtube">YouTube Video</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {aiSource === 'document' ? 'Document Content' : 'YouTube URL'}
                </label>
                <textarea
                  value={aiContent}
                  onChange={(e) => setAiContent(e.target.value)}
                  placeholder={aiSource === 'document' ? 'Paste your document content here...' : 'Paste YouTube video URL here...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={5}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Round</label>
                <select
                  value={aiRoundId}
                  onChange={(e) => setAiRoundId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Round</option>
                  {rounds.filter(r => r.type === 'QUIZ').map((round) => (
                    <option key={round.id} value={round.id}>
                      {round.name}
                    </option>
                  ))}
                </select>
              </div>

              {aiError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {aiError}
                </div>
              )}

              <button
                type="submit"
                disabled={aiLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {aiLoading ? 'Generating...' : 'Generate Questions'}
              </button>

              <p className="mt-2 text-sm text-gray-600">
                Note: AI generation requires an OpenAI API key set in your environment variables.
              </p>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 p-6 border-b">Existing Questions</h2>
          <div className="divide-y divide-gray-200">
            {questions.map((question) => (
              <div key={question.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                        {question.rounds?.name}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                        {question.type}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {question.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                        {question.points} pts
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                    <p className="text-gray-600 mt-1">{question.description}</p>
                    {question.type === 'QUIZ' && question.question_options.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {question.question_options.map((option) => (
                          <div
                            key={option.id}
                            className={`text-sm px-2 py-1 rounded ${
                              option.is_correct
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {option.is_correct && '✓ '} {option.option_text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="ml-4 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {questions.length === 0 && (
              <div className="p-6 text-center text-gray-500">No questions yet. Add your first question!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
