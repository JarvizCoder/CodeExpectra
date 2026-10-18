import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const roundId = searchParams.get('round_id')

    let query = supabase
      .from('round_results')
      .select('*, profiles(full_name, email), rounds(name)')
      .order('score', { ascending: false })

    if (roundId) {
      query = query.eq('round_id', roundId)
    }

    const { data: results, error } = await query

    if (error) throw error

    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
