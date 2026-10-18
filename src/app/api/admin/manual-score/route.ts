import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const manualScoreSchema = z.object({
  round_id: z.string().uuid(),
  user_id: z.string().uuid(),
  score: z.number().min(0),
  max_score: z.number().min(0),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = await createServiceClient()
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.data.user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = manualScoreSchema.parse(body)

    // Upsert the result
    const { data: result, error } = await serviceSupabase
      .from('round_results')
      .upsert({
        round_id: validatedData.round_id,
        user_id: validatedData.user_id,
        score: validatedData.score,
        max_score: validatedData.max_score,
        qualified: false,
        calculated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Log the action
    await serviceSupabase.from('audit_logs').insert({
      user_id: user.data.user.id,
      action: 'MANUAL_SCORE_ENTRY',
      entity_type: 'round_results',
      entity_id: result.id,
      new_value: { score: validatedData.score, max_score: validatedData.max_score },
      reason: 'Manual score entry by admin',
    })

    return NextResponse.json(result)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
