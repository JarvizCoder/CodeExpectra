import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import QuestionManager from './QuestionManager'

export const dynamic = 'force-dynamic'

export default async function QuestionsPage() {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    redirect('/auth/login')
  }

  // Check if user is admin
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

  // Get all questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*, rounds(name), question_options(*)')
    .order('round_id, order_index', { ascending: true })

  return <QuestionManager rounds={rounds || []} questions={questions || []} />
}
