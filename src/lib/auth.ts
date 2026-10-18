import { createClient as createServerClient, createServiceClient } from './supabase/server'

export type UserRole = 'ADMIN' | 'PARTICIPANT'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
}

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Use service role to bypass RLS when fetching profile
  const serviceSupabase = await createServiceClient()
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as UserProfile
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }
  return user
}

export async function isAdmin(userId: string): Promise<boolean> {
  const serviceSupabase = await createServiceClient()
  const { data } = await serviceSupabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return data?.role === 'ADMIN'
}
