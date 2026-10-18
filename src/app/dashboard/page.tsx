import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    redirect('/auth/login')
  }

  // Get user profile using service role to bypass RLS
  const serviceSupabase = await createServiceClient()
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.data.user.id)
    .single()

  // Get all rounds
  const { data: rounds } = await supabase
    .from('rounds')
    .select('*')
    .order('created_at', { ascending: true })

  // Get user's attempts
  const { data: attempts } = await supabase
    .from('round_attempts')
    .select('*')
    .eq('user_id', user.data.user.id)

  // Get user's results
  const { data: results } = await supabase
    .from('round_results')
    .select('*')
    .eq('user_id', user.data.user.id)

  // Get leaderboard
  const { data: leaderboard } = await supabase
    .from('round_results')
    .select('*, profiles(full_name, email), rounds(name)')
    .order('score', { ascending: false })
    .limit(10)

  const getRoundStatus = (round: any) => {
    const attempt = attempts?.find((a: any) => a.round_id === round.id)
    const result = results?.find((r: any) => r.round_id === round.id)

    if (result) {
      return result.qualified ? 'QUALIFIED' : 'COMPLETED'
    }
    if (attempt?.status === 'SUBMITTED') {
      return 'COMPLETED'
    }
    if (attempt?.status === 'IN_PROGRESS') {
      return 'IN_PROGRESS'
    }
    if (round.status === 'OPEN') {
      return 'OPEN'
    }
    return 'LOCKED'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'QUALIFIED':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'LOCKED':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const isRoundAccessible = (round: any, status: string) => {
    if (status === 'LOCKED') return false
    if (status === 'IN_PROGRESS') return true
    if (status === 'OPEN') return true
    return false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">CodeBattle</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{profile?.full_name || profile?.email}</span>
              <Link
                href="/auth/logout"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Competition Rounds</h2>
          <p className="mt-2 text-gray-600">Complete each round to qualify for the next stage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {rounds?.map((round: any) => {
            const status = getRoundStatus(round)
            const accessible = isRoundAccessible(round, status)

            return (
              <div
                key={round.id}
                className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                  accessible ? 'border-indigo-500' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{round.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{round.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>Type: {round.type}</p>
                  <p>Duration: {round.duration_minutes} minutes</p>
                  <p>Points per question: {round.points_per_question}</p>
                  {round.negative_marking && (
                    <p className="text-red-600">
                      Negative marking: {round.negative_percentage}%
                    </p>
                  )}
                </div>

                {accessible ? (
                  <Link
                    href={`/dashboard/${round.type.toLowerCase()}/${round.id}`}
                    className="inline-block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {status === 'IN_PROGRESS' ? 'Continue' : 'Start Round'}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-block w-full text-center px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                  >
                    {status === 'LOCKED' ? 'Locked' : 'Completed'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Results */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Results</h3>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Round
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qualified
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results?.map((result: any) => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rounds?.find((r: any) => r.id === result.round_id)?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.max_score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {result.qualified ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                            No
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!results || results.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No results yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Leaderboard (Top 10)</h3>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Round
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard?.map((result: any, index: number) => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.profiles?.full_name || result.profiles?.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.rounds?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.score}
                      </td>
                    </tr>
                  ))}
                  {!leaderboard || leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No leaderboard data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {profile?.role === 'ADMIN' && (
          <div className="mt-8">
            <Link
              href="/admin"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Admin Portal
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
