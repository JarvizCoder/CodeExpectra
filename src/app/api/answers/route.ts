import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const saveAnswerSchema = z.object({
  attempt_id: z.string().uuid(),
  question_id: z.string().uuid(),
  option_id: z.string().uuid().nullable(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = saveAnswerSchema.parse(body)

    // Verify the attempt belongs to the user
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
      return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 })
    }

    // Upsert the answer
    const { data: savedAnswer, error } = await supabase
      .from('saved_answers')
      .upsert({
        attempt_id: validatedData.attempt_id,
        question_id: validatedData.question_id,
        option_id: validatedData.option_id,
        saved_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(savedAnswer)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
