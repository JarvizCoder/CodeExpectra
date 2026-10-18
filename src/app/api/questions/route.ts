import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roundId = searchParams.get('round_id')

    if (!roundId) {
      return NextResponse.json({ error: 'round_id is required' }, { status: 400 })
    }

    // Get questions with options (excluding is_correct for participants)
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        *,
        question_options(id, option_text, order_index)
      `)
      .eq('round_id', roundId)
      .order('order_index', { ascending: true })

    if (error) throw error

    return NextResponse.json(questions)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
