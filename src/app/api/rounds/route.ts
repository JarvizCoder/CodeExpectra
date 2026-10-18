import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateRoundSchema = z.object({
  status: z.enum(['LOCKED', 'OPEN', 'PAUSED', 'CLOSED']).optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: rounds, error } = await supabase
      .from('rounds')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(rounds)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin using service role to bypass RLS
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
    const { id, ...updateData } = body
    const validatedData = updateRoundSchema.parse(updateData)

    // Use service role to bypass RLS for the update
    const { data: round, error } = await serviceSupabase
      .from('rounds')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log the action using service role
    await serviceSupabase.from('audit_logs').insert({
      user_id: user.data.user.id,
      action: 'UPDATE_ROUND',
      entity_type: 'rounds',
      entity_id: id,
      old_value: body.oldValue,
      new_value: validatedData,
      reason: body.reason,
    })

    return NextResponse.json(round)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
