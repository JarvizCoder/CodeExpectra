interface Judge0Submission {
  source_code: string
  language_id: number
  stdin?: string
  expected_output?: string
}

interface Judge0Response {
  token: string
  status?: {
    id: number
    description: string
  }
  stdout?: string
  stderr?: string
  compile_output?: string
  time?: string
  memory?: string
}

const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  csharp: 51,
  go: 60,
  rust: 73,
  typescript: 74,
}

export async function executeCode(
  code: string,
  language: string,
  input: string = '',
  expectedOutput?: string
): Promise<{
  success: boolean
  output?: string
  error?: string
  executionTime?: string
  memory?: string
}> {
  const apiUrl = process.env.JUDGE0_API_URL || 'https://emkc.org/api/v2/piston'
  const apiKey = process.env.JUDGE0_API_KEY

  const languageId = LANGUAGE_IDS[language.toLowerCase()] || LANGUAGE_IDS.javascript

  try {
    // Use Piston API (simpler, no auth required)
    if (apiUrl.includes('piston')) {
      const response = await fetch(`${apiUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
        },
        body: JSON.stringify({
          language: language.toLowerCase(),
          version: '*',
          files: [
            {
              content: code,
            },
          ],
          stdin: input,
        }),
      })

      if (!response.ok) {
        throw new Error(`Judge0 API error: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.run) {
        const output = result.run.stdout || ''
        const error = result.run.stderr || result.run.compile?.output || ''
        const success = !error && (!expectedOutput || output.trim() === expectedOutput.trim())

        return {
          success,
          output,
          error: error || undefined,
          executionTime: result.run.cpuTime ? `${result.run.cpuTime}s` : undefined,
          memory: result.run.memory ? `${result.run.memory}KB` : undefined,
        }
      }

      return {
        success: false,
        error: 'No output from code execution',
      }
    }

    // Fallback to standard Judge0 API
    const submission: Judge0Submission = {
      source_code: code,
      language_id: languageId,
      stdin: input,
    }

    const response = await fetch(`${apiUrl}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify(submission),
    })

    if (!response.ok) {
      throw new Error(`Judge0 API error: ${response.statusText}`)
    }

    const initialResult: Judge0Response = await response.json()

    // Poll for result
    let finalResult: Judge0Response = initialResult
    let attempts = 0
    const maxAttempts = 20

    while (
      finalResult.status &&
      finalResult.status.id <= 2 &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const pollResponse = await fetch(
        `${apiUrl}/submissions/${finalResult.token}`,
        {
          headers: {
            ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
          },
        }
      )
      finalResult = await pollResponse.json()
      attempts++
    }

    const output = finalResult.stdout || ''
    const error = finalResult.stderr || finalResult.compile_output || ''
    const success =
      finalResult.status?.id === 3 &&
      !error &&
      (!expectedOutput || output.trim() === expectedOutput.trim())

    return {
      success,
      output,
      error: error || undefined,
      executionTime: finalResult.time,
      memory: finalResult.memory,
    }
  } catch (error: any) {
    console.error('Judge0 execution error:', error)
    return {
      success: false,
      error: error.message || 'Code execution failed',
    }
  }
}

export async function runTestCases(
  code: string,
  language: string,
  testCases: Array<{ input: string; expected_output: string }>
): Promise<
  Array<{
    passed: boolean
    input: string
    expected_output: string
    actual_output?: string
    error?: string
    execution_time?: string
  }>
> {
  const results = []

  for (const testCase of testCases) {
    const result = await executeCode(
      code,
      language,
      testCase.input,
      testCase.expected_output
    )

    results.push({
      passed: result.success,
      input: testCase.input,
      expected_output: testCase.expected_output,
      actual_output: result.output,
      error: result.error,
      execution_time: result.executionTime,
    })
  }

  return results
}
