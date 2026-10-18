import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createQuestionSchema = z.object({
  round_id: z.string().uuid(),
  type: z.enum(['QUIZ', 'CODING', 'DEBUGGING']),
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
  points: z.number().min(1).default(10),
  order_index: z.number().min(0),
  starter_code: z.string().optional(),
  reference_solution: z.string().optional(),
  language: z.string().optional(),
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
    const validatedData = createQuestionSchema.parse(body)

    const { data: question, error } = await serviceSupabase
      .from('questions')
      .insert({
        round_id: validatedData.round_id,
        type: validatedData.type,
        title: validatedData.title,
        description: validatedData.description,
        difficulty: validatedData.difficulty,
        points: validatedData.points,
        order_index: validatedData.order_index,
        starter_code: validatedData.starter_code,
        reference_solution: validatedData.reference_solution,
        language: validatedData.language,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(question)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('id')

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 })
    }

    const { error } = await serviceSupabase
      .from('questions')
      .delete()
      .eq('id', questionId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
