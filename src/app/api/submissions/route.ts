import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { executeCode, runTestCases } from '@/lib/judge0'

const createSubmissionSchema = z.object({
  attempt_id: z.string().uuid(),
  question_id: z.string().uuid(),
  code: z.string().min(1),
  language: z.string().min(1),
})

const runCodeSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
  input: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    // Handle run code action (test before submit)
    if (action === 'run') {
      const validatedData = runCodeSchema.parse(body)
      const result = await executeCode(
        validatedData.code,
        validatedData.language,
        validatedData.input || ''
      )
      return NextResponse.json(result)
    }

    // Handle submit action
    const validatedData = createSubmissionSchema.parse(body)

    // Verify the attempt belongs to the user
    const { data: attempt } = await supabase
      .from('round_attempts')
      .select('*')
      .eq('id', validatedData.attempt_id)
      .eq('user_id', user.data.user.id)
      .single()

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 })
    }

    // Use service role to bypass RLS
    const serviceSupabase = await createServiceClient()

    // Get test cases for the question
    const { data: testCases } = await serviceSupabase
      .from('test_cases')
      .select('*')
      .eq('question_id', validatedData.question_id)
      .order('order_index', { ascending: true })

    // Upsert the submission
    const { data: submission, error } = await serviceSupabase
      .from('submissions')
      .upsert({
        attempt_id: validatedData.attempt_id,
        question_id: validatedData.question_id,
        code: validatedData.code,
        language: validatedData.language,
        submitted_at: new Date().toISOString(),
        status: 'PROCESSING',
      })
      .select()
      .single()

    if (error) throw error

    // Execute code against test cases
    let finalStatus = 'ACCEPTED'
    let totalExecutionTime = 0

    if (testCases && testCases.length > 0) {
      const testCaseInputs = testCases.map((tc) => ({
        input: tc.input,
        expected_output: tc.expected_output,
      }))

      const results = await runTestCases(
        validatedData.code,
        validatedData.language,
        testCaseInputs
      )

      // Check if all test cases passed
      const allPassed = results.every((r) => r.passed)
      finalStatus = allPassed ? 'ACCEPTED' : 'REJECTED'

      // Create evaluation records
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const testCase = testCases[i]

        await serviceSupabase.from('evaluations').upsert({
          submission_id: submission.id,
          test_case_id: testCase.id,
          passed: result.passed,
          actual_output: result.actual_output,
          error_message: result.error,
          execution_time_ms: result.execution_time
            ? parseInt(result.execution_time) * 1000
            : null,
        })
      }

      // Calculate total execution time
      totalExecutionTime = results.reduce((sum, r) => {
        return sum + (r.execution_time ? parseInt(r.execution_time) * 1000 : 0)
      }, 0)
    } else {
      // No test cases - auto-accept
      finalStatus = 'ACCEPTED'
    }

    // Update submission with final status
    await serviceSupabase
      .from('submissions')
      .update({
        status: finalStatus,
        execution_time_ms: totalExecutionTime || null,
      })
      .eq('id', submission.id)

    // Fetch updated submission
    const { data: updatedSubmission } = await serviceSupabase
      .from('submissions')
      .select('*, evaluations(*)')
      .eq('id', submission.id)
      .single()

    return NextResponse.json(updatedSubmission)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Submission error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
