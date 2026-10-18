import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LogoutPage() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
