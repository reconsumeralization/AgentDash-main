/**
 * Database Migration Script
 * Applies pending Supabase migrations.
 */

const { execSync } = require('child_process')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') })

async function runMigrations() {
  console.log('🚀 Running Supabase database migrations...')

  try {
    // Ensure Supabase CLI is logged in and linked to the project
    // This assumes `supabase login` and `supabase link` have been run manually
    // or are handled by the CI/CD environment.

    // Run migrations
    execSync('supabase migration up', { stdio: 'inherit' })
    console.log('✅ Supabase database migrations completed successfully!')
  } catch (error) {
    console.error('❌ Supabase database migrations failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  runMigrations().catch(console.error)
}
