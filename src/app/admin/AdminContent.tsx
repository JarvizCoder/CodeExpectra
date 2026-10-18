'use client'

import Link from 'next/link'
import { useState } from 'react'

interface AdminContentProps {
  rounds: any[]
  participants: any[]
  attempts: any[]
  results: any[]
  questions: any[]
}

export default function AdminContent({ rounds, participants, attempts, results, questions }: AdminContentProps) {
  const [activeTab, setActiveTab] = useState('rounds')
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false)
  const [showMarksForm, setShowMarksForm] = useState(false)
  const [selectedRound, setSelectedRound] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [manualScore, setManualScore] = useState('')
  const [manualMaxScore, setManualMaxScore] = useState('')

  const handleRoundStatusChange = async (roundId: string, status: string, reason: string) => {
    try {
      const response = await fetch('/api/rounds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roundId,
          status,
          reason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Failed to update round: ${error.error}`)
        return
      }

      window.location.reload()
    } catch (error) {
      console.error('Error updating round:', error)
      alert('Failed to update round. Please try again.')
    }
  }

  const handleCalculateResults = async () => {
    await fetch('/api/admin/calculate-results', {
      method: 'POST',
    })
    window.location.reload()
  }

  const handleManualScoreEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/admin/manual-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          round_id: selectedRound,
          user_id: selectedUser,
          score: parseInt(manualScore),
          max_score: parseInt(manualMaxScore),
        }),
      })
      window.location.reload()
    } catch (error) {
      console.error('Error updating score:', error)
      alert('Failed to update score')
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

  const tabs = [
    { id: 'rounds', label: 'Round Management' },
    { id: 'questions', label: 'Question Manager' },
    { id: 'participants', label: 'Participants' },
    { id: 'marks', label: 'Marks Entry' },
    { id: 'attempts', label: 'Recent Attempts' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-purple-600">Admin Portal</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/questions"
                className="text-indigo-600 hover:text-indigo-700"
              >
                Advanced Question Manager
              </Link>
              <Link
                href="/dashboard"
                className="text-indigo-600 hover:text-indigo-700"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/auth/logout"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'rounds' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 p-6 border-b">Round Management</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Round</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rounds?.map((round: any) => (
                  <tr key={round.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{round.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{round.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        round.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                        round.status === 'LOCKED' ? 'bg-red-100 text-red-800' :
                        round.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{round.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{round.duration_minutes} min</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {round.status === 'LOCKED' && (
                        <button onClick={() => handleRoundStatusChange(round.id, 'OPEN', 'Opening round')} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Open</button>
                      )}
                      {round.status === 'OPEN' && (
                        <button onClick={() => handleRoundStatusChange(round.id, 'PAUSED', 'Pausing round')} className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700">Pause</button>
                      )}
                      {(round.status === 'OPEN' || round.status === 'PAUSED') && (
                        <button onClick={() => handleRoundStatusChange(round.id, 'CLOSED', 'Closing round')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Close</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Question Manager</h2>
              <Link href="/admin/questions" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Advanced Question Manager
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {questions?.map((question: any) => (
                <div key={question.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">{question.rounds?.name}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">{question.type}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">{question.difficulty}</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">{question.points} pts</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                      <p className="text-gray-600 mt-1">{question.description}</p>
                    </div>
                    <button onClick={() => handleDeleteQuestion(question.id)} className="ml-4 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">Delete</button>
                  </div>
                </div>
              ))}
              {questions?.length === 0 && <div className="p-6 text-center text-gray-500">No questions yet</div>}
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 p-6 border-b">Participants ({participants?.length || 0})</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants?.map((participant: any) => (
                  <tr key={participant.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participant.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(participant.created_at).toISOString().split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'marks' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Manual Score Entry</h2>
            <form onSubmit={handleManualScoreEntry} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
                <select value={selectedRound} onChange={(e) => setSelectedRound(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  <option value="">Select Round</option>
                  {rounds?.map((round: any) => (
                    <option key={round.id} value={round.id}>{round.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participant</label>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                  <option value="">Select Participant</option>
                  {participants?.map((participant: any) => (
                    <option key={participant.id} value={participant.id}>{participant.full_name || participant.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <input type="number" value={manualScore} onChange={(e) => setManualScore(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                <input type="number" value={manualMaxScore} onChange={(e) => setManualMaxScore(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required min="0" />
              </div>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Update Score</button>
            </form>
          </div>
        )}

        {activeTab === 'attempts' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 p-6 border-b">Recent Attempts</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Round</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attempts?.slice(0, 20).map((attempt: any) => (
                  <tr key={attempt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attempt.profiles?.full_name || attempt.profiles?.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attempt.rounds?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${attempt.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{attempt.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attempt.total_score || 0} / {attempt.max_score || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(attempt.started_at).toISOString().replace('T', ' ').substring(0, 19)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
              <button onClick={handleCalculateResults} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Calculate Results</button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Round</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualified</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results?.map((result: any, index: number) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.rank || index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.profiles?.full_name || result.profiles?.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.rounds?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.score} / {result.max_score}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result.qualified ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Yes</span> : <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">No</span>}
                    </td>
                  </tr>
                ))}
                {!results || results.length === 0 && <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No results calculated yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
