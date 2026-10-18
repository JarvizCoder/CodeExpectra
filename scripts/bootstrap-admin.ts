/**
 * Admin Bootstrap Script
 *
 * This script helps bootstrap the first admin user.
 * Run it with: npx tsx scripts/bootstrap-admin.ts
 *
 * Before running, make sure you have:
 * 1. Created a Supabase project
 * 2. Set up your .env.local file with Supabase credentials
 * 3. Created a user account through the Supabase Auth UI
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function bootstrapAdmin(email: string) {
  try {
    // Get the user by email
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      throw error
    }

    const user = users.find((u: any) => u.email === email)

    if (!user) {
      console.error(`User with email ${email} not found. Please create the user account first through Supabase Auth UI.`)
      process.exit(1)
    }

    // Update the user's role to ADMIN
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'ADMIN' })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    console.log(`✅ Successfully promoted ${email} to ADMIN role`)
    console.log(`User ID: ${user.id}`)
  } catch (error) {
    console.error('Error bootstrapping admin:', error)
    process.exit(1)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: npx tsx scripts/bootstrap-admin.ts <email>')
  console.log('Example: npx tsx scripts/bootstrap-admin.ts admin@example.com')
  process.exit(1)
}

bootstrapAdmin(email)
