/**
 * Database Seeding Script
 * Populates the database with sample data.
 */

const { createSampleData } = require('./setup-database')

async function runSeed() {
  console.log('🌱 Seeding database with sample data...')
  try {
    await createSampleData()
    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  runSeed().catch(console.error)
}
