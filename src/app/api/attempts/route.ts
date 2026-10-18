import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createAttemptSchema = z.object({
  round_id: z.string().uuid(),
})

const submitAttemptSchema = z.object({
  attempt_id: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'start') {
      const validatedData = createAttemptSchema.parse(body)

      // Check if round is open
      const { data: round } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', validatedData.round_id)
        .single()

      if (!round || round.status !== 'OPEN') {
        return NextResponse.json({ error: 'Round is not open', roundStatus: round?.status }, { status: 400 })
      }

      // Check if user has a profile using service role to bypass RLS
      const serviceSupabase = await createServiceClient()

      // Try to get profile - if it fails due to RLS, we'll create it anyway
      let profile
      try {
        const { data: profileData } = await serviceSupabase
          .from('profiles')
          .select('*')
          .eq('id', user.data.user.id)
          .single()
        profile = profileData
      } catch (e) {
        // Profile might not exist or RLS blocking it
        console.log('Could not fetch profile, will try to create')
      }

      if (!profile) {
        // Create profile if it doesn't exist using RPC to bypass RLS
        const { error: profileError } = await serviceSupabase.rpc('create_profile_if_not_exists', {
          p_id: user.data.user.id,
          p_email: user.data.user.email || '',
          p_full_name: user.data.user.user_metadata?.full_name || '',
          p_role: 'PARTICIPANT',
        })

        if (profileError) {
          console.error('Failed to create profile:', profileError)
          return NextResponse.json({ error: 'Failed to create user profile', details: profileError.message }, { status: 500 })
        }
      }

      // Check if user already has an attempt
      const { data: existingAttempt } = await supabase
        .from('round_attempts')
        .select('*')
        .eq('round_id', validatedData.round_id)
        .eq('user_id', user.data.user.id)
        .single()

      if (existingAttempt) {
        return NextResponse.json({ error: 'Attempt already exists' }, { status: 400 })
      }

      // Create new attempt
      const { data: attempt, error } = await supabase
        .from('round_attempts')
        .insert({
          round_id: validatedData.round_id,
          user_id: user.data.user.id,
          started_at: new Date().toISOString(),
          status: 'IN_PROGRESS',
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(attempt)
    }

    if (action === 'submit') {
      const validatedData = submitAttemptSchema.parse(body)

      // Get the attempt
      const { data: attempt } = await supabase
        .from('round_attempts')
        .select('*')
        .eq('id', validatedData.attempt_id)
        .eq('user_id', user.data.user.id)
        .single()

      if (!attempt) {
        return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
      }

      if (attempt.status !== 'IN_PROGRESS') {
        return NextResponse.json({ error: 'Attempt already submitted' }, { status: 400 })
      }

      // Calculate score for quiz rounds
      if (attempt.round_id) {
        const { data: round } = await supabase
          .from('rounds')
          .select('*, questions(*)')
          .eq('id', attempt.round_id)
          .single()

        if (round && round.type === 'QUIZ') {
          // Get all saved answers
          const { data: savedAnswers } = await supabase
            .from('saved_answers')
            .select('*, question_options(*)')
            .eq('attempt_id', attempt.id)

          if (savedAnswers) {
            let totalScore = 0
            let maxScore = 0

            for (const answer of savedAnswers) {
              maxScore += round.points_per_question
              if (answer.question_options?.is_correct) {
                totalScore += round.points_per_question
              } else if (round.negative_marking && answer.option_id) {
                totalScore -= Math.round(round.points_per_question * (round.negative_percentage / 100))
              }
            }

            // Update attempt with score
            await supabase
              .from('round_attempts')
              .update({
                total_score: totalScore,
                max_score: maxScore,
                status: 'SUBMITTED',
                submitted_at: new Date().toISOString(),
              })
              .eq('id', attempt.id)
          }
        } else {
          // For coding rounds, just mark as submitted
          await supabase
            .from('round_attempts')
            .update({
              status: 'SUBMITTED',
              submitted_at: new Date().toISOString(),
            })
            .eq('id', attempt.id)
        }
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roundId = searchParams.get('round_id')

    let query = supabase
      .from('round_attempts')
      .select('*')
      .eq('user_id', user.data.user.id)

    if (roundId) {
      query = query.eq('round_id', roundId)
    }

    const { data: attempts, error } = await query

    if (error) throw error

    return NextResponse.json(attempts)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
