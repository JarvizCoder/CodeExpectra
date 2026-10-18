import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const bootstrapSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()

    if (!user.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = bootstrapSchema.parse(body)

    // For security, only allow the current user to bootstrap themselves as admin
    // This prevents arbitrary users from being promoted
    if (user.data.user.email !== email) {
      return NextResponse.json(
        { error: 'You can only promote your own account to admin' },
        { status: 403 }
      )
    }

    // Check if user has a profile using service role to bypass RLS
    const serviceSupabase = await createServiceClient()
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.data.user.id)
      .single()

    if (!profile) {
      // Create profile if it doesn't exist
      const { error: insertError } = await serviceSupabase.from('profiles').insert({
        id: user.data.user.id,
        email: user.data.user.email || '',
        full_name: user.data.user.user_metadata?.full_name || '',
        role: 'ADMIN',
      })

      if (insertError) throw insertError
    } else {
      // Update existing profile to admin
      const { error: updateError } = await serviceSupabase
        .from('profiles')
        .update({ role: 'ADMIN' })
        .eq('id', user.data.user.id)

      if (updateError) throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'User promoted to admin successfully',
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
