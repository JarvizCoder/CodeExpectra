import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.data.user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all rounds
    const { data: rounds } = await supabase
      .from('rounds')
      .select('*')
      .order('created_at', { ascending: true })

    if (!rounds) {
      return NextResponse.json({ error: 'No rounds found' }, { status: 404 })
    }

    // Calculate results for each round
    for (const round of rounds) {
      // Get all attempts for this round
      const { data: attempts } = await supabase
        .from('round_attempts')
        .select('*')
        .eq('round_id', round.id)
        .eq('status', 'SUBMITTED')

      if (!attempts || attempts.length === 0) continue

      // Sort by score (descending)
      attempts.sort((a, b) => (b.total_score || 0) - (a.total_score || 0))

      // Calculate qualification
      const qualificationCount = Math.ceil(
        attempts.length * (round.qualification_percent / 100)
      )

      // Create or update results
      for (let i = 0; i < attempts.length; i++) {
        const attempt = attempts[i]
        const qualified = i < qualificationCount

        // Delete existing result for this user and round
        await supabase
          .from('round_results')
          .delete()
          .eq('round_id', round.id)
          .eq('user_id', attempt.user_id)

        // Insert new result
        await supabase.from('round_results').insert({
          round_id: round.id,
          user_id: attempt.user_id,
          score: attempt.total_score || 0,
          max_score: attempt.max_score || 0,
          rank: i + 1,
          qualified,
          calculated_at: new Date().toISOString(),
        })

        // Create qualification decision
        await supabase
          .from('qualification_decisions')
          .upsert({
            round_id: round.id,
            user_id: attempt.user_id,
            qualified,
            reason: qualified
              ? `Top ${round.qualification_percent}% of participants`
              : 'Did not qualify',
            decided_by: user.data.user.id,
            decided_at: new Date().toISOString(),
          })
      }
    }

    return NextResponse.json({ success: true, message: 'Results calculated successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
