import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createOptionSchema = z.object({
  question_id: z.string().uuid(),
  option_text: z.string().min(1),
  is_correct: z.boolean(),
  order_index: z.number().min(0),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
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
    const validatedData = createOptionSchema.parse(body)

    const { data: option, error } = await serviceSupabase
      .from('question_options')
      .insert({
        question_id: validatedData.question_id,
        option_text: validatedData.option_text,
        is_correct: validatedData.is_correct,
        order_index: validatedData.order_index,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(option)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
