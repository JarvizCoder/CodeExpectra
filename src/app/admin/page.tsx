import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminContent from './AdminContent'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    redirect('/auth/login')
  }

  // Check if user is admin using service role to bypass RLS
  const serviceSupabase = await createServiceClient()
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.data.user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Get all rounds
  const { data: rounds } = await supabase
    .from('rounds')
    .select('*')
    .order('created_at', { ascending: true })

  // Get participants
  const { data: participants } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'PARTICIPANT')

  // Get attempts
  const { data: attempts } = await supabase
    .from('round_attempts')
    .select('*, profiles(full_name, email), rounds(name)')
    .order('started_at', { ascending: false })

  // Get results
  const { data: results } = await supabase
    .from('round_results')
    .select('*, profiles(full_name, email), rounds(name)')
    .order('score', { ascending: false })

  // Get all questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*, rounds(name), question_options(*)')
    .order('round_id, order_index', { ascending: true })

  return <AdminContent rounds={rounds} participants={participants} attempts={attempts} results={results} questions={questions} />
}
