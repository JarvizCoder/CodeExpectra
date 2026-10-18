import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const generateSchema = z.object({
  source: z.enum(['document', 'youtube']),
  content: z.string().min(1),
  round_id: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
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
    const validatedData = generateSchema.parse(body)

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    let content = validatedData.content

    // If YouTube, fetch transcript (simplified - in production you'd use a YouTube transcript API)
    if (validatedData.source === 'youtube') {
      // For now, we'll extract video ID and note that this requires a transcript service
      const videoIdMatch = validatedData.content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
      if (!videoIdMatch) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
      }

      // In production, use a service like youtube-transcript-api
      // For now, we'll return an error
      return NextResponse.json(
        { error: 'YouTube transcript extraction requires additional setup. Please use document mode or set up a transcript service.' },
        { status: 400 }
      )
    }

    // Generate questions using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates multiple-choice quiz questions from educational content. Generate 5 questions with 4 options each, marking the correct answer.',
          },
          {
            role: 'user',
            content: `Generate 5 multiple-choice quiz questions from the following content. Return the response as a JSON array with this structure:
[
  {
    "title": "Question title",
    "description": "Question description",
    "difficulty": "EASY|MEDIUM|HARD",
    "points": 10,
    "options": [
      { "text": "Option 1", "is_correct": false },
      { "text": "Option 2", "is_correct": true },
      { "text": "Option 3", "is_correct": false },
      { "text": "Option 4", "is_correct": false }
    ]
  }
]

Content:
${content}`,
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return NextResponse.json({ error: 'Failed to generate questions with AI' }, { status: 500 })
    }

    const data = await response.json()
    const generatedContent = data.choices[0].message.content

    // Parse the generated questions
    let questions
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        questions = JSON.parse(generatedContent)
      }
    } catch (e) {
      console.error('Failed to parse AI response:', generatedContent)
      return NextResponse.json({ error: 'Failed to parse generated questions' }, { status: 500 })
    }

    // Get current order index for the round
    const { data: existingQuestions } = await serviceSupabase
      .from('questions')
      .select('order_index')
      .eq('round_id', validatedData.round_id)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = existingQuestions?.[0]?.order_index + 1 || 0

    // Insert questions into database
    const createdQuestions = []
    for (const question of questions) {
      const { data: newQuestion, error } = await serviceSupabase
        .from('questions')
        .insert({
          round_id: validatedData.round_id,
          type: 'QUIZ',
          title: question.title,
          description: question.description,
          difficulty: question.difficulty || 'EASY',
          points: question.points || 10,
          order_index: nextOrderIndex + createdQuestions.length,
        })
        .select()
        .single()

      if (error) {
        console.error('Error inserting question:', error)
        continue
      }

      // Insert options
      for (const option of question.options) {
        await serviceSupabase.from('question_options').insert({
          question_id: newQuestion.id,
          option_text: option.text,
          is_correct: option.is_correct,
          order_index: question.options.indexOf(option),
        })
      }

      createdQuestions.push(newQuestion)
    }

    return NextResponse.json({
      success: true,
      questions: createdQuestions,
      total: createdQuestions.length,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error generating questions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
