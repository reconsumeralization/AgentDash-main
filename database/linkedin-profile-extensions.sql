-- LinkedIn Profile Database Schema Extensions
-- Extends the existing AgentDash schema with comprehensive LinkedIn profile data storage
-- Based on comprehensive LinkedIn profile types defined in lib/linkedin-comprehensive-profile-types.ts

-- Enable additional extensions for LinkedIn profile features
CREATE EXTENSION IF NOT EXISTS "pgvector"; -- For semantic search on profile content
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search on names and skills
CREATE EXTENSION IF NOT EXISTS "hstore"; -- For flexible key-value storage

-- LinkedIn Profiles table (comprehensive profile storage)
CREATE TABLE linkedin_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  linkedin_id TEXT UNIQUE NOT NULL, -- LinkedIn's unique identifier

  -- Basic Information
  first_name TEXT,
  last_name TEXT,
  localized_first_name TEXT,
  localized_last_name TEXT,
  maiden_name TEXT,
  formatted_name TEXT,
  phonetic_first_name TEXT,
  phonetic_last_name TEXT,
  formatted_phonetic_name TEXT,

  -- Professional Information
  headline TEXT,
  summary TEXT,
  industry TEXT,

  -- Profile Pictures and Media
  profile_picture_original TEXT,
  profile_picture_cropped TEXT,
  profile_picture_cropped_height INTEGER,
  profile_picture_cropped_width INTEGER,
  profile_picture_cropped_x INTEGER,
  profile_picture_cropped_y INTEGER,
  background_image_url TEXT,
  background_image_width INTEGER,
  background_image_height INTEGER,
  background_image_alt TEXT,

  -- Contact Information
  location_country TEXT,
  location_region TEXT,
  location_city TEXT,
  location_postal_code TEXT,
  location_country_code TEXT,
  location_geographic_area TEXT,

  -- Metadata and Analytics
  connection_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_open_to_work BOOLEAN DEFAULT false,
  is_hiring BOOLEAN DEFAULT false,
  public_profile_url TEXT,
  vanity_name TEXT,
  is_public BOOLEAN DEFAULT false,

  -- Custom Analytics
  trust_score DECIMAL(3,2) DEFAULT 0.0,
  influence_score DECIMAL(3,2) DEFAULT 0.0,
  network_quality DECIMAL(3,2) DEFAULT 0.0,
  engagement_rate DECIMAL(5,2) DEFAULT 0.0,
  professional_rank INTEGER DEFAULT 0,
  industry_rank INTEGER DEFAULT 0,
  connection_growth DECIMAL(5,2) DEFAULT 0.0,
  profile_completeness DECIMAL(5,2) DEFAULT 0.0,
  response_rate DECIMAL(5,2) DEFAULT 0.0,

  -- Data Management
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed')),
  data_source TEXT DEFAULT 'api' CHECK (data_source IN ('api', 'scraping', 'manual', 'cached')),
  api_version TEXT,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'pending')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Positions table (work experience)
CREATE TABLE linkedin_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_position_id TEXT,

  title TEXT,
  summary TEXT,
  description TEXT,
  is_current BOOLEAN DEFAULT false,

  -- Date information
  start_year INTEGER,
  start_month INTEGER,
  start_day INTEGER,
  end_year INTEGER,
  end_month INTEGER,
  end_day INTEGER,

  -- Company information
  company_id TEXT,
  company_name TEXT,
  company_industry TEXT,
  company_size TEXT,
  company_type TEXT,
  company_website TEXT,
  company_logo TEXT,

  -- Location
  location_country TEXT,
  location_region TEXT,
  location_city TEXT,
  location_postal_code TEXT,
  location_country_code TEXT,
  location_geographic_area TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Education table
CREATE TABLE linkedin_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_education_id TEXT,

  school_name TEXT,
  field_of_study TEXT,
  degree TEXT,
  grade TEXT,
  activities TEXT,
  notes TEXT,

  -- Date information
  start_year INTEGER,
  start_month INTEGER,
  end_year INTEGER,
  end_month INTEGER,

  -- School information
  school_id TEXT,
  school_logo TEXT,
  school_website TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Skills table
CREATE TABLE linkedin_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_skill_id TEXT,

  name TEXT NOT NULL,
  endorsements INTEGER DEFAULT 0,
  category TEXT,
  level TEXT CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Skill Endorsers table
CREATE TABLE linkedin_skill_endorsers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES linkedin_skills(id) ON DELETE CASCADE,
  endorser_linkedin_id TEXT,
  endorser_name TEXT,
  endorser_profile_picture TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Certifications table
CREATE TABLE linkedin_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_certification_id TEXT,

  name TEXT NOT NULL,
  authority TEXT,
  number TEXT,
  url TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Date information
  start_year INTEGER,
  start_month INTEGER,
  end_year INTEGER,
  end_month INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Languages table
CREATE TABLE linkedin_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_language_id TEXT,

  name TEXT NOT NULL,
  proficiency TEXT CHECK (proficiency IN ('ELEMENTARY', 'LIMITED_WORKING', 'PROFESSIONAL_WORKING', 'FULL_PROFESSIONAL', 'NATIVE_OR_BILINGUAL')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Publications table
CREATE TABLE linkedin_publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_publication_id TEXT,

  title TEXT NOT NULL,
  publisher TEXT,
  description TEXT,
  url TEXT,
  authors TEXT[] DEFAULT '{}',

  -- Date information
  date_year INTEGER,
  date_month INTEGER,
  date_day INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Projects table
CREATE TABLE linkedin_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_project_id TEXT,

  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  is_current BOOLEAN DEFAULT false,
  members TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',

  -- Date information
  start_year INTEGER,
  start_month INTEGER,
  end_year INTEGER,
  end_month INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Honors and Awards table
CREATE TABLE linkedin_honors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_honor_id TEXT,

  name TEXT NOT NULL,
  issuer TEXT,
  description TEXT,
  occupation TEXT,

  -- Date information
  issue_year INTEGER,
  issue_month INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Volunteering Experiences table
CREATE TABLE linkedin_volunteering_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_volunteering_id TEXT,

  role TEXT,
  cause TEXT,
  description TEXT,
  is_current BOOLEAN DEFAULT false,

  -- Organization information
  organization_id TEXT,
  organization_name TEXT,
  organization_description TEXT,
  organization_website TEXT,

  -- Date information
  start_year INTEGER,
  start_month INTEGER,
  end_year INTEGER,
  end_month INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Patents table
CREATE TABLE linkedin_patents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_patent_id TEXT,

  title TEXT NOT NULL,
  summary TEXT,
  number TEXT,
  status TEXT CHECK (status IN ('APPLICATION_FILED', 'PATENT_GRANTED', 'PATENT_ISSUED')),
  office TEXT,
  inventors TEXT[] DEFAULT '{}',
  url TEXT,

  -- Date information
  date_year INTEGER,
  date_month INTEGER,
  date_day INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Courses table
CREATE TABLE linkedin_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_course_id TEXT,

  name TEXT NOT NULL,
  number TEXT,
  description TEXT,
  provider TEXT,
  certificate_url TEXT,

  -- Date information
  completion_year INTEGER,
  completion_month INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Test Scores table
CREATE TABLE linkedin_test_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_test_score_id TEXT,

  name TEXT NOT NULL,
  score TEXT,
  description TEXT,

  -- Date information
  date_year INTEGER,
  date_month INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Phone Numbers table
CREATE TABLE linkedin_phone_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,

  type TEXT CHECK (type IN ('HOME', 'WORK', 'MOBILE', 'FAX', 'OTHER')),
  number TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Websites table
CREATE TABLE linkedin_websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,

  type TEXT CHECK (type IN ('PERSONAL', 'COMPANY', 'BLOG', 'RSS', 'PORTFOLIO', 'OTHER')),
  url TEXT NOT NULL,
  label TEXT,
  category TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Instant Messages table
CREATE TABLE linkedin_instant_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,

  type TEXT CHECK (type IN ('SKYPE', 'AIM', 'ICQ', 'YAHOO', 'MSN', 'GTALK', 'JABBER', 'OTHER')),
  handle TEXT NOT NULL,
  provider TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Organizations table
CREATE TABLE linkedin_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  linkedin_organization_id TEXT,

  name TEXT NOT NULL,
  position TEXT,
  description TEXT,
  summary TEXT,
  is_current BOOLEAN DEFAULT false,

  -- Date information
  start_year INTEGER,
  start_month INTEGER,
  end_year INTEGER,
  end_month INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Profile Analytics table (performance metrics)
CREATE TABLE linkedin_profile_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,

  -- Profile Views
  profile_views_current INTEGER DEFAULT 0,
  profile_views_previous INTEGER DEFAULT 0,
  profile_views_change INTEGER DEFAULT 0,
  profile_views_change_percentage DECIMAL(5,2) DEFAULT 0.0,
  profile_views_trend TEXT DEFAULT 'stable' CHECK (profile_views_trend IN ('up', 'down', 'stable')),

  -- Search Appearances
  search_appearances_current INTEGER DEFAULT 0,
  search_appearances_previous INTEGER DEFAULT 0,
  search_appearances_change INTEGER DEFAULT 0,
  search_appearances_change_percentage DECIMAL(5,2) DEFAULT 0.0,
  search_appearances_trend TEXT DEFAULT 'stable' CHECK (search_appearances_trend IN ('up', 'down', 'stable')),

  -- Connection Requests
  connection_requests_sent INTEGER DEFAULT 0,
  connection_requests_received INTEGER DEFAULT 0,
  connection_requests_accepted INTEGER DEFAULT 0,
  connection_acceptance_rate DECIMAL(5,2) DEFAULT 0.0,
  response_rate DECIMAL(5,2) DEFAULT 0.0,

  -- Content Performance
  posts_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  content_engagement_rate DECIMAL(5,2) DEFAULT 0.0,
  content_reach INTEGER DEFAULT 0,
  content_impressions INTEGER DEFAULT 0,

  -- Time period for this analytics snapshot
  analytics_period_start TIMESTAMP WITH TIME ZONE,
  analytics_period_end TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Network Analytics table (connection analysis)
CREATE TABLE linkedin_network_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,

  -- Connection Metrics
  total_connections INTEGER DEFAULT 0,
  new_connections_this_month INTEGER DEFAULT 0,

  -- Network Influence
  network_size INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  influence_score DECIMAL(3,2) DEFAULT 0.0,
  thought_leadership_rank INTEGER DEFAULT 0,
  industry_rank INTEGER DEFAULT 0,
  connection_quality_score DECIMAL(3,2) DEFAULT 0.0,

  -- Network Composition (stored as JSONB for flexibility)
  connections_by_industry JSONB DEFAULT '[]',
  connections_by_seniority JSONB DEFAULT '[]',
  connections_by_company JSONB DEFAULT '[]',
  connections_by_location JSONB DEFAULT '[]',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Profile Insights table (AI-enhanced data)
CREATE TABLE linkedin_profile_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,

  -- Personality Insights
  personality_traits TEXT[] DEFAULT '{}',
  communication_style TEXT,
  decision_making_style TEXT,
  work_style TEXT,

  -- Career Trajectory
  career_progression TEXT,
  industry_switches INTEGER DEFAULT 0,
  title_progression TEXT[] DEFAULT '{}',
  skill_evolution TEXT[] DEFAULT '{}',

  -- Network Analysis
  industry_diversity DECIMAL(5,2) DEFAULT 0.0,
  seniority_mix_junior DECIMAL(5,2) DEFAULT 0.0,
  seniority_mix_mid DECIMAL(5,2) DEFAULT 0.0,
  seniority_mix_senior DECIMAL(5,2) DEFAULT 0.0,
  seniority_mix_executive DECIMAL(5,2) DEFAULT 0.0,
  geographic_spread TEXT[] DEFAULT '{}',
  company_types TEXT[] DEFAULT '{}',

  -- Content Analysis
  posting_frequency TEXT,
  content_themes TEXT[] DEFAULT '{}',
  engagement_patterns TEXT[] DEFAULT '{}',
  thought_leadership_score DECIMAL(3,2) DEFAULT 0.0,

  -- Analysis timestamp
  analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confidence_score DECIMAL(3,2) DEFAULT 0.0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Profile Recommendations table
CREATE TABLE linkedin_profile_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,

  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('profile_optimization', 'networking_opportunity', 'content_suggestion', 'skill_development', 'career_opportunity')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  action_required TEXT,

  -- For networking opportunities
  target_user_id TEXT,
  target_company TEXT,
  match_score DECIMAL(3,2),
  requirements TEXT[] DEFAULT '{}',

  -- Status tracking
  is_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Time Series Data table (for trends and graphs)
CREATE TABLE linkedin_time_series_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,

  metric_type TEXT NOT NULL CHECK (metric_type IN ('profile_views', 'search_appearances', 'connection_growth', 'follower_growth', 'engagement_rate', 'reach', 'impressions')),
  date_recorded DATE NOT NULL,
  value INTEGER NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(profile_id, metric_type, date_recorded)
);

-- LinkedIn Social Media Presence table
CREATE TABLE linkedin_social_media_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,

  twitter_handle TEXT,
  facebook_profile TEXT,
  instagram_handle TEXT,
  youtube_channel TEXT,
  github_username TEXT,
  personal_website TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for LinkedIn profile tables (optimized for performance)
CREATE INDEX idx_linkedin_profiles_user_id ON linkedin_profiles(user_id);
CREATE INDEX idx_linkedin_profiles_linkedin_id ON linkedin_profiles(linkedin_id);
CREATE INDEX idx_linkedin_profiles_sync_status ON linkedin_profiles(sync_status);
CREATE INDEX idx_linkedin_profiles_last_synced ON linkedin_profiles(last_synced DESC);
CREATE INDEX idx_linkedin_profiles_trust_score ON linkedin_profiles(trust_score DESC);
CREATE INDEX idx_linkedin_profiles_influence_score ON linkedin_profiles(influence_score DESC);
CREATE INDEX idx_linkedin_profiles_completeness ON linkedin_profiles(profile_completeness DESC);

CREATE INDEX idx_linkedin_positions_profile_id ON linkedin_positions(profile_id);
CREATE INDEX idx_linkedin_positions_current ON linkedin_positions(is_current) WHERE is_current = true;
CREATE INDEX idx_linkedin_positions_company ON linkedin_positions(company_name);

CREATE INDEX idx_linkedin_education_profile_id ON linkedin_education(profile_id);
CREATE INDEX idx_linkedin_education_school ON linkedin_education(school_name);

CREATE INDEX idx_linkedin_skills_profile_id ON linkedin_skills(profile_id);
CREATE INDEX idx_linkedin_skills_name ON linkedin_skills(name);
CREATE INDEX idx_linkedin_skills_endorsements ON linkedin_skills(endorsements DESC);
CREATE INDEX idx_linkedin_skills_category ON linkedin_skills(category);

CREATE INDEX idx_linkedin_skill_endorsers_skill_id ON linkedin_skill_endorsers(skill_id);
CREATE INDEX idx_linkedin_skill_endorsers_linkedin_id ON linkedin_skill_endorsers(endorser_linkedin_id);

CREATE INDEX idx_linkedin_certifications_profile_id ON linkedin_certifications(profile_id);
CREATE INDEX idx_linkedin_certifications_authority ON linkedin_certifications(authority);
CREATE INDEX idx_linkedin_certifications_active ON linkedin_certifications(is_active) WHERE is_active = true;

CREATE INDEX idx_linkedin_languages_profile_id ON linkedin_languages(profile_id);
CREATE INDEX idx_linkedin_languages_proficiency ON linkedin_languages(proficiency);

CREATE INDEX idx_linkedin_publications_profile_id ON linkedin_publications(profile_id);
CREATE INDEX idx_linkedin_publications_publisher ON linkedin_publications(publisher);

CREATE INDEX idx_linkedin_projects_profile_id ON linkedin_projects(profile_id);
CREATE INDEX idx_linkedin_projects_current ON linkedin_projects(is_current) WHERE is_current = true;

CREATE INDEX idx_linkedin_honors_profile_id ON linkedin_honors(profile_id);
CREATE INDEX idx_linkedin_honors_issuer ON linkedin_honors(issuer);

CREATE INDEX idx_linkedin_volunteering_profile_id ON linkedin_volunteering_experiences(profile_id);
CREATE INDEX idx_linkedin_volunteering_current ON linkedin_volunteering_experiences(is_current) WHERE is_current = true;

CREATE INDEX idx_linkedin_patents_profile_id ON linkedin_patents(profile_id);
CREATE INDEX idx_linkedin_patents_status ON linkedin_patents(status);

CREATE INDEX idx_linkedin_courses_profile_id ON linkedin_courses(profile_id);
CREATE INDEX idx_linkedin_courses_provider ON linkedin_courses(provider);

CREATE INDEX idx_linkedin_test_scores_profile_id ON linkedin_test_scores(profile_id);

CREATE INDEX idx_linkedin_phone_numbers_profile_id ON linkedin_phone_numbers(profile_id);
CREATE INDEX idx_linkedin_phone_numbers_primary ON linkedin_phone_numbers(is_primary) WHERE is_primary = true;

CREATE INDEX idx_linkedin_websites_profile_id ON linkedin_websites(profile_id);
CREATE INDEX idx_linkedin_websites_type ON linkedin_websites(type);

CREATE INDEX idx_linkedin_instant_messages_profile_id ON linkedin_instant_messages(profile_id);
CREATE INDEX idx_linkedin_instant_messages_type ON linkedin_instant_messages(type);

CREATE INDEX idx_linkedin_organizations_profile_id ON linkedin_organizations(profile_id);
CREATE INDEX idx_linkedin_organizations_current ON linkedin_organizations(is_current) WHERE is_current = true;

CREATE INDEX idx_linkedin_profile_analytics_profile_id ON linkedin_profile_analytics(profile_id);
CREATE INDEX idx_linkedin_profile_analytics_period ON linkedin_profile_analytics(analytics_period_start, analytics_period_end);

CREATE INDEX idx_linkedin_network_analytics_profile_id ON linkedin_network_analytics(profile_id);
CREATE INDEX idx_linkedin_network_analytics_influence ON linkedin_network_analytics(influence_score DESC);

CREATE INDEX idx_linkedin_profile_insights_profile_id ON linkedin_profile_insights(profile_id);
CREATE INDEX idx_linkedin_profile_insights_timestamp ON linkedin_profile_insights(analysis_timestamp DESC);

CREATE INDEX idx_linkedin_recommendations_profile_id ON linkedin_profile_recommendations(profile_id);
CREATE INDEX idx_linkedin_recommendations_type ON linkedin_profile_recommendations(recommendation_type);
CREATE INDEX idx_linkedin_recommendations_priority ON linkedin_profile_recommendations(priority);
CREATE INDEX idx_linkedin_recommendations_applied ON linkedin_profile_recommendations(is_applied);

CREATE INDEX idx_linkedin_time_series_profile_id ON linkedin_time_series_data(profile_id);
CREATE INDEX idx_linkedin_time_series_metric_date ON linkedin_time_series_data(metric_type, date_recorded DESC);

CREATE INDEX idx_linkedin_social_media_profile_id ON linkedin_social_media_presence(profile_id);

-- Full-text search indexes for profiles and content
CREATE INDEX idx_linkedin_profiles_name_search ON linkedin_profiles USING GIN((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_linkedin_profiles_headline_search ON linkedin_profiles USING GIN(to_tsvector('english', headline));
CREATE INDEX idx_linkedin_profiles_summary_search ON linkedin_profiles USING GIN(to_tsvector('english', summary));

-- GIN indexes for array and JSONB fields
CREATE INDEX idx_linkedin_patents_inventors ON linkedin_patents USING GIN(inventors);
CREATE INDEX idx_linkedin_publications_authors ON linkedin_publications USING GIN(authors);
CREATE INDEX idx_linkedin_projects_members ON linkedin_projects USING GIN(members);
CREATE INDEX idx_linkedin_projects_skills ON linkedin_projects USING GIN(skills);
CREATE INDEX idx_linkedin_network_by_industry ON linkedin_network_analytics USING GIN(connections_by_industry);
CREATE INDEX idx_linkedin_network_by_seniority ON linkedin_network_analytics USING GIN(connections_by_seniority);
CREATE INDEX idx_linkedin_network_by_company ON linkedin_network_analytics USING GIN(connections_by_company);
CREATE INDEX idx_linkedin_network_by_location ON linkedin_network_analytics USING GIN(connections_by_location);

-- Row Level Security for LinkedIn profile tables
ALTER TABLE linkedin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_skill_endorsers ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_honors ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_volunteering_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_patents ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_instant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_network_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_profile_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_profile_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_time_series_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_social_media_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for LinkedIn profiles (users can only access their own data)
CREATE POLICY "Users can view their LinkedIn profiles" ON linkedin_profiles FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
CREATE POLICY "Users can manage their LinkedIn profiles" ON linkedin_profiles FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Apply similar policies to all LinkedIn-related tables
CREATE POLICY "Users can view their LinkedIn positions" ON linkedin_positions FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn positions" ON linkedin_positions FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn education" ON linkedin_education FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn education" ON linkedin_education FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn skills" ON linkedin_skills FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn skills" ON linkedin_skills FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn skill endorsers" ON linkedin_skill_endorsers FOR SELECT USING (skill_id IN (SELECT id FROM linkedin_skills WHERE profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text))));
CREATE POLICY "Users can manage their LinkedIn skill endorsers" ON linkedin_skill_endorsers FOR ALL USING (skill_id IN (SELECT id FROM linkedin_skills WHERE profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text))));

CREATE POLICY "Users can view their LinkedIn certifications" ON linkedin_certifications FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn certifications" ON linkedin_certifications FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn languages" ON linkedin_languages FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn languages" ON linkedin_languages FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn publications" ON linkedin_publications FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn publications" ON linkedin_publications FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn projects" ON linkedin_projects FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn projects" ON linkedin_projects FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn honors" ON linkedin_honors FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn honors" ON linkedin_honors FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn volunteering" ON linkedin_volunteering_experiences FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn volunteering" ON linkedin_volunteering_experiences FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn patents" ON linkedin_patents FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn patents" ON linkedin_patents FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn courses" ON linkedin_courses FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn courses" ON linkedin_courses FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn test scores" ON linkedin_test_scores FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn test scores" ON linkedin_test_scores FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn phone numbers" ON linkedin_phone_numbers FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn phone numbers" ON linkedin_phone_numbers FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn websites" ON linkedin_websites FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn websites" ON linkedin_websites FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn instant messages" ON linkedin_instant_messages FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn instant messages" ON linkedin_instant_messages FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn organizations" ON linkedin_organizations FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn organizations" ON linkedin_organizations FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn analytics" ON linkedin_profile_analytics FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn analytics" ON linkedin_profile_analytics FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn network analytics" ON linkedin_network_analytics FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn network analytics" ON linkedin_network_analytics FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn insights" ON linkedin_profile_insights FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn insights" ON linkedin_profile_insights FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn recommendations" ON linkedin_profile_recommendations FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn recommendations" ON linkedin_profile_recommendations FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn time series data" ON linkedin_time_series_data FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn time series data" ON linkedin_time_series_data FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

CREATE POLICY "Users can view their LinkedIn social media presence" ON linkedin_social_media_presence FOR SELECT USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));
CREATE POLICY "Users can manage their LinkedIn social media presence" ON linkedin_social_media_presence FOR ALL USING (profile_id IN (SELECT id FROM linkedin_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)));

-- Updated_at triggers for LinkedIn tables
CREATE TRIGGER update_linkedin_profiles_updated_at BEFORE UPDATE ON linkedin_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_positions_updated_at BEFORE UPDATE ON linkedin_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_education_updated_at BEFORE UPDATE ON linkedin_education FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_skills_updated_at BEFORE UPDATE ON linkedin_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_certifications_updated_at BEFORE UPDATE ON linkedin_certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_languages_updated_at BEFORE UPDATE ON linkedin_languages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_publications_updated_at BEFORE UPDATE ON linkedin_publications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_projects_updated_at BEFORE UPDATE ON linkedin_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_honors_updated_at BEFORE UPDATE ON linkedin_honors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_volunteering_updated_at BEFORE UPDATE ON linkedin_volunteering_experiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_patents_updated_at BEFORE UPDATE ON linkedin_patents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_courses_updated_at BEFORE UPDATE ON linkedin_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_test_scores_updated_at BEFORE UPDATE ON linkedin_test_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_phone_numbers_updated_at BEFORE UPDATE ON linkedin_phone_numbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_websites_updated_at BEFORE UPDATE ON linkedin_websites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_instant_messages_updated_at BEFORE UPDATE ON linkedin_instant_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_organizations_updated_at BEFORE UPDATE ON linkedin_organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_profile_analytics_updated_at BEFORE UPDATE ON linkedin_profile_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_network_analytics_updated_at BEFORE UPDATE ON linkedin_network_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_profile_insights_updated_at BEFORE UPDATE ON linkedin_profile_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_recommendations_updated_at BEFORE UPDATE ON linkedin_profile_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_linkedin_social_media_updated_at BEFORE UPDATE ON linkedin_social_media_presence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Advanced database functions for LinkedIn profile operations

-- Function to calculate LinkedIn profile completeness score
CREATE OR REPLACE FUNCTION calculate_linkedin_profile_completeness(profile_id_param UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    score DECIMAL(5,2) := 0.0;
    total_fields INTEGER := 20; -- Total number of key profile sections
BEGIN
    -- Basic info (weight: 20%)
    SELECT score + (CASE
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL AND headline IS NOT NULL THEN 20.0
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN 15.0
        WHEN first_name IS NOT NULL OR last_name IS NOT NULL THEN 10.0
        ELSE 0.0
    END) INTO score
    FROM linkedin_profiles WHERE id = profile_id_param;

    -- Profile picture (weight: 10%)
    SELECT score + (CASE
        WHEN profile_picture_original IS NOT NULL THEN 10.0
        ELSE 0.0
    END) INTO score
    FROM linkedin_profiles WHERE id = profile_id_param;

    -- Summary (weight: 10%)
    SELECT score + (CASE
        WHEN summary IS NOT NULL AND LENGTH(summary) > 50 THEN 10.0
        WHEN summary IS NOT NULL THEN 5.0
        ELSE 0.0
    END) INTO score
    FROM linkedin_profiles WHERE id = profile_id_param;

    -- Experience (weight: 20%)
    SELECT score + (CASE
        WHEN COUNT(*) >= 3 THEN 20.0
        WHEN COUNT(*) >= 2 THEN 15.0
        WHEN COUNT(*) >= 1 THEN 10.0
        ELSE 0.0
    END) INTO score
    FROM linkedin_positions WHERE profile_id = profile_id_param;

    -- Education (weight: 10%)
    SELECT score + (CASE
        WHEN COUNT(*) >= 2 THEN 10.0
        WHEN COUNT(*) >= 1 THEN 7.0
        ELSE 0.0
    END) INTO score
    FROM linkedin_education WHERE profile_id = profile_id_param;

    -- Skills (weight: 15%)
    SELECT score + (CASE
        WHEN COUNT(*) >= 10 THEN 15.0
        WHEN COUNT(*) >= 5 THEN 12.0
        WHEN COUNT(*) >= 3 THEN 8.0
        WHEN COUNT(*) >= 1 THEN 5.0
        ELSE 0.0
    END) INTO score
    FROM linkedin_skills WHERE profile_id = profile_id_param;

    -- Contact info (weight: 5%)
    SELECT score + (CASE
        WHEN COUNT(*) >= 2 THEN 5.0
        WHEN COUNT(*) >= 1 THEN 3.0
        ELSE 0.0
    END) INTO score
    FROM (
        SELECT profile_id FROM linkedin_phone_numbers WHERE profile_id = profile_id_param
        UNION ALL
        SELECT profile_id FROM linkedin_websites WHERE profile_id = profile_id_param
    ) AS contact_info;

    -- Additional sections (weight: 10%)
    -- Publications, Projects, Certifications, etc.
    SELECT score + (CASE
        WHEN (
            (SELECT COUNT(*) FROM linkedin_publications WHERE profile_id = profile_id_param) +
            (SELECT COUNT(*) FROM linkedin_projects WHERE profile_id = profile_id_param) +
            (SELECT COUNT(*) FROM linkedin_certifications WHERE profile_id = profile_id_param) +
            (SELECT COUNT(*) FROM linkedin_volunteering_experiences WHERE profile_id = profile_id_param)
        ) >= 3 THEN 10.0
        WHEN (
            (SELECT COUNT(*) FROM linkedin_publications WHERE profile_id = profile_id_param) +
            (SELECT COUNT(*) FROM linkedin_projects WHERE profile_id = profile_id_param) +
            (SELECT COUNT(*) FROM linkedin_certifications WHERE profile_id = profile_id_param) +
            (SELECT COUNT(*) FROM linkedin_volunteering_experiences WHERE profile_id = profile_id_param)
        ) >= 1 THEN 5.0
        ELSE 0.0
    END) INTO score;

    RETURN LEAST(score, 100.0); -- Cap at 100%
END;
$$ LANGUAGE plpgsql;

-- Function to update LinkedIn profile completeness automatically
CREATE OR REPLACE FUNCTION update_linkedin_profile_completeness()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE linkedin_profiles
    SET profile_completeness = calculate_linkedin_profile_completeness(NEW.profile_id)
    WHERE id = NEW.profile_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update profile completeness
CREATE TRIGGER trigger_update_completeness_positions AFTER INSERT OR UPDATE OR DELETE ON linkedin_positions
FOR EACH ROW EXECUTE FUNCTION update_linkedin_profile_completeness();

CREATE TRIGGER trigger_update_completeness_education AFTER INSERT OR UPDATE OR DELETE ON linkedin_education
FOR EACH ROW EXECUTE FUNCTION update_linkedin_profile_completeness();

CREATE TRIGGER trigger_update_completeness_skills AFTER INSERT OR UPDATE OR DELETE ON linkedin_skills
FOR EACH ROW EXECUTE FUNCTION update_linkedin_profile_completeness();

CREATE TRIGGER trigger_update_completeness_certifications AFTER INSERT OR UPDATE OR DELETE ON linkedin_certifications
FOR EACH ROW EXECUTE FUNCTION update_linkedin_profile_completeness();

-- Function to search LinkedIn profiles with intelligent ranking
CREATE OR REPLACE FUNCTION search_linkedin_profiles(
    search_query TEXT,
    limit_results INTEGER DEFAULT 50,
    user_id_filter UUID DEFAULT NULL
)
RETURNS TABLE(
    profile_id UUID,
    user_id UUID,
    full_name TEXT,
    headline TEXT,
    industry TEXT,
    location TEXT,
    completeness_score DECIMAL(5,2),
    influence_score DECIMAL(3,2),
    relevance_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lp.id,
        lp.user_id,
        COALESCE(lp.first_name || ' ' || lp.last_name, '') as full_name,
        lp.headline,
        lp.industry,
        COALESCE(lp.location_city || ', ' || lp.location_region, lp.location_city, lp.location_region, '') as location,
        lp.profile_completeness,
        lp.influence_score,
        (
            -- Name match
            CASE WHEN (lp.first_name || ' ' || lp.last_name) ILIKE '%' || search_query || '%' THEN 10.0 ELSE 0.0 END +
            -- Headline match
            CASE WHEN lp.headline ILIKE '%' || search_query || '%' THEN 8.0 ELSE 0.0 END +
            -- Industry match
            CASE WHEN lp.industry ILIKE '%' || search_query || '%' THEN 6.0 ELSE 0.0 END +
            -- Skills match
            (SELECT COALESCE(COUNT(*) * 2.0, 0.0) FROM linkedin_skills ls WHERE ls.profile_id = lp.id AND ls.name ILIKE '%' || search_query || '%') +
            -- Company match
            (SELECT COALESCE(COUNT(*) * 3.0, 0.0) FROM linkedin_positions pos WHERE pos.profile_id = lp.id AND pos.company_name ILIKE '%' || search_query || '%') +
            -- Boost by profile completeness and influence
            (lp.profile_completeness / 10.0) + (lp.influence_score * 2.0)
        ) as relevance_score
    FROM linkedin_profiles lp
    WHERE
        (user_id_filter IS NULL OR lp.user_id = user_id_filter)
        AND (
            (lp.first_name || ' ' || lp.last_name) ILIKE '%' || search_query || '%'
            OR lp.headline ILIKE '%' || search_query || '%'
            OR lp.industry ILIKE '%' || search_query || '%'
            OR EXISTS (SELECT 1 FROM linkedin_skills ls WHERE ls.profile_id = lp.id AND ls.name ILIKE '%' || search_query || '%')
            OR EXISTS (SELECT 1 FROM linkedin_positions pos WHERE pos.profile_id = lp.id AND pos.company_name ILIKE '%' || search_query || '%')
        )
    ORDER BY relevance_score DESC, lp.influence_score DESC, lp.profile_completeness DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Add LinkedIn profile sync status update function
CREATE OR REPLACE FUNCTION update_linkedin_sync_status(
    profile_id_param UUID,
    status_param TEXT,
    error_message_param TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE linkedin_profiles
    SET
        sync_status = status_param,
        last_synced = CASE WHEN status_param = 'completed' THEN NOW() ELSE last_synced END,
        updated_at = NOW()
    WHERE id = profile_id_param;

    -- Log sync event
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, success, details)
    SELECT
        lp.user_id,
        'linkedin_sync',
        'linkedin_profile',
        profile_id_param::TEXT,
        (status_param = 'completed'),
        jsonb_build_object(
            'sync_status', status_param,
            'error_message', error_message_param,
            'timestamp', NOW()
        )
    FROM linkedin_profiles lp
    WHERE lp.id = profile_id_param;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE linkedin_profiles IS 'Comprehensive LinkedIn profile data storage supporting all LinkedIn profile fields';
COMMENT ON TABLE linkedin_positions IS 'Work experience and employment history from LinkedIn profiles';
COMMENT ON TABLE linkedin_education IS 'Educational background and academic achievements';
COMMENT ON TABLE linkedin_skills IS 'Professional skills with endorsement tracking';
COMMENT ON TABLE linkedin_profile_analytics IS 'Performance metrics and analytics for LinkedIn profiles';
COMMENT ON TABLE linkedin_network_analytics IS 'Network analysis and connection insights';
COMMENT ON TABLE linkedin_profile_insights IS 'AI-enhanced personality and career insights';
COMMENT ON TABLE linkedin_profile_recommendations IS 'System-generated recommendations for profile optimization';
COMMENT ON TABLE linkedin_time_series_data IS 'Historical data for trending and performance analysis';

COMMENT ON FUNCTION calculate_linkedin_profile_completeness IS 'Calculates a weighted completeness score (0-100%) for LinkedIn profiles';
COMMENT ON FUNCTION search_linkedin_profiles IS 'Intelligent search across LinkedIn profiles with relevance ranking';
COMMENT ON FUNCTION update_linkedin_sync_status IS 'Updates sync status and logs synchronization events';