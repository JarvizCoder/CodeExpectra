import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  const migrationPath = path.join(__dirname, '../supabase/migrations/009_update_coding_questions.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  console.log('Applying migration...')

  const { data, error } = await supabase.rpc('exec_sql', { sql })

  if (error) {
    console.error('Error applying migration:', error)
    process.exit(1)
  }

  console.log('Migration applied successfully!')
}

applyMigration()
