/**
 * Database Setup Script
 * Sets up the AgentDash database schema and initial data
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  console.log('🚀 Setting up AgentDash database...')
  
  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📋 Executing database schema...')
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (schemaError) {
      console.error('❌ Schema execution failed:', schemaError.message)
      return false
    }
    
    console.log('✅ Database schema created successfully')
    
    // Create initial admin user
    console.log('👤 Creating initial admin user...')
    const { error: userError } = await supabase.auth.admin.createUser({
      email: 'admin@agentdash.com',
      password: 'admin123!',
      email_confirm: true,
      user_metadata: {
        name: 'Admin User',
        role: 'admin'
      }
    })
    
    if (userError) {
      console.warn('⚠️  Admin user creation failed:', userError.message)
    } else {
      console.log('✅ Admin user created successfully')
    }
    
    // Insert initial user record
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        email: 'admin@agentdash.com',
        name: 'Admin User',
        subscription_tier: 'enterprise'
      })
    
    if (insertError) {
      console.warn('⚠️  User record insertion failed:', insertError.message)
    } else {
      console.log('✅ User record created successfully')
    }
    
    // Create sample data
    console.log('📊 Creating sample data...')
    await createSampleData()
    
    console.log('🎉 Database setup completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    return false
  }
}

async function createSampleData() {
  try {
    // Get admin user
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@agentdash.com')
      .single()
    
    if (!adminUser) {
      console.warn('⚠️  Admin user not found, skipping sample data creation')
      return
    }
    
    // Create sample LinkedIn agent
    const { error: agentError } = await supabase
      .from('agents')
      .insert({
        name: 'LinkedIn Content Manager',
        description: 'Automated LinkedIn content management and posting',
        type: 'linkedin',
        config: {
          autoPost: true,
          postFrequency: 'daily',
          contentTypes: ['text', 'image', 'video'],
          hashtags: ['#AI', '#Automation', '#Productivity']
        },
        user_id: adminUser.id,
        is_active: true
      })
    
    if (agentError) {
      console.warn('⚠️  Sample agent creation failed:', agentError.message)
    } else {
      console.log('✅ Sample LinkedIn agent created')
    }
    
    // Create sample Office 365 agent
    const { error: officeAgentError } = await supabase
      .from('agents')
      .insert({
        name: 'Office 365 Monitor',
        description: 'Monitor Office 365 service health and user activity',
        type: 'office365',
        config: {
          monitorServices: ['Exchange', 'SharePoint', 'Teams'],
          alertThresholds: {
            errorRate: 5,
            responseTime: 2000
          },
          notifications: {
            email: true,
            slack: false
          }
        },
        user_id: adminUser.id,
        is_active: true
      })
    
    if (officeAgentError) {
      console.warn('⚠️  Sample Office 365 agent creation failed:', officeAgentError.message)
    } else {
      console.log('✅ Sample Office 365 agent created')
    }
    
    // Create sample knowledge base
    const { error: kbError } = await supabase
      .from('knowledge_bases')
      .insert({
        name: 'LinkedIn Best Practices',
        description: 'Collection of LinkedIn marketing and engagement best practices',
        type: 'linkedin',
        user_id: adminUser.id,
        is_active: true
      })
    
    if (kbError) {
      console.warn('⚠️  Sample knowledge base creation failed:', kbError.message)
    } else {
      console.log('✅ Sample knowledge base created')
    }
    
    // Create sample workflow
    const { error: workflowError } = await supabase
      .from('workflows')
      .insert({
        name: 'Daily LinkedIn Posting',
        description: 'Automated daily LinkedIn content posting workflow',
        steps: [
          {
            type: 'content_generation',
            config: {
              topic: 'AI and automation trends',
              tone: 'professional',
              length: 'medium'
            }
          },
          {
            type: 'linkedin_post',
            config: {
              schedule: '09:00',
              hashtags: ['#AI', '#Automation', '#Tech']
            }
          }
        ],
        user_id: adminUser.id,
        is_active: true
      })
    
    if (workflowError) {
      console.warn('⚠️  Sample workflow creation failed:', workflowError.message)
    } else {
      console.log('✅ Sample workflow created')
    }
    
  } catch (error) {
    console.warn('⚠️  Sample data creation failed:', error.message)
  }
}

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection test failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    return true
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message)
    return false
  }
}

async function main() {
  console.log('🔧 AgentDash Database Setup')
  console.log('============================')
  
  // Test connection first
  const connectionOk = await testDatabaseConnection()
  if (!connectionOk) {
    console.error('❌ Cannot proceed without database connection')
    process.exit(1)
  }
  
  // Setup database
  const setupOk = await setupDatabase()
  if (!setupOk) {
    console.error('❌ Database setup failed')
    process.exit(1)
  }
  
  console.log('')
  console.log('🎉 Setup completed successfully!')
  console.log('')
  console.log('📋 Next steps:')
  console.log('   1. Update your .env.local with the correct database password')
  console.log('   2. Run the application: npm run dev')
  console.log('   3. Access the admin panel with: admin@agentdash.com / admin123!')
  console.log('')
  console.log('🔗 Useful links:')
  console.log('   - Supabase Dashboard: https://supabase.com/dashboard')
  console.log('   - Database URL: https://slkndlakxpkyizwupfgz.supabase.co')
  console.log('')
}

// Run the setup
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  setupDatabase,
  testDatabaseConnection,
  createSampleData
}
