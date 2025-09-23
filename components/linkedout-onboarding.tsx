"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Target, 
  Users, 
  Brain, 
  Shield, 
  Zap, 
  Star,
  Heart,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  TrendingUp,
  Network,
  MessageSquare,
  Settings,
  Sparkles,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Github,
  Mail,
  Phone,
  Building,
  Award,
  BookOpen,
  Code,
  Palette,
  Music,
  Camera,
  Gamepad2,
  Coffee,
  Plane,
  Car,
  Home,
  Wifi,
  Smartphone,
  Laptop,
  Monitor,
  Cloud
} from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ReactNode
  isCompleted: boolean
}

interface UserProfile {
  // Basic Information
  name: string
  email: string
  location: string
  timezone: string
  
  // Professional Information
  currentRole: string
  company: string
  industry: string
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  
  // Aspirations
  careerGoals: string[]
  skillGoals: string[]
  projectGoals: string[]
  learningGoals: string[]
  
  // Interests & Causes
  interests: string[]
  causes: string[]
  hobbies: string[]
  
  // Networking Preferences
  networkingStyle: 'introvert' | 'ambivert' | 'extrovert'
  preferredPlatforms: string[]
  communicationStyle: 'formal' | 'casual' | 'mixed'
  
  // Privacy & Security
  privacyLevel: 'public' | 'professional' | 'private'
  dataSharing: boolean
  securityPreferences: string[]
}

const INTEREST_CATEGORIES = {
  technology: [
    { id: 'ai-ml', label: 'Artificial Intelligence & Machine Learning', icon: Brain },
    { id: 'web-dev', label: 'Web Development', icon: Code },
    { id: 'mobile-dev', label: 'Mobile Development', icon: Smartphone },
    { id: 'data-science', label: 'Data Science & Analytics', icon: TrendingUp },
    { id: 'cybersecurity', label: 'Cybersecurity', icon: Shield },
    { id: 'cloud-computing', label: 'Cloud Computing', icon: Cloud },
    { id: 'blockchain', label: 'Blockchain & Crypto', icon: Shield },
    { id: 'iot', label: 'Internet of Things', icon: Wifi }
  ],
  business: [
    { id: 'entrepreneurship', label: 'Entrepreneurship', icon: Briefcase },
    { id: 'marketing', label: 'Marketing & Growth', icon: TrendingUp },
    { id: 'finance', label: 'Finance & Investment', icon: TrendingUp },
    { id: 'strategy', label: 'Business Strategy', icon: Target },
    { id: 'operations', label: 'Operations & Management', icon: Settings },
    { id: 'sales', label: 'Sales & Business Development', icon: MessageSquare }
  ],
  creative: [
    { id: 'design', label: 'Design & UX', icon: Palette },
    { id: 'writing', label: 'Writing & Content', icon: BookOpen },
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'music', label: 'Music & Audio', icon: Music },
    { id: 'video', label: 'Video Production', icon: Camera },
    { id: 'gaming', label: 'Gaming & Interactive Media', icon: Gamepad2 }
  ],
  lifestyle: [
    { id: 'travel', label: 'Travel & Adventure', icon: Plane },
    { id: 'fitness', label: 'Fitness & Wellness', icon: Heart },
    { id: 'food', label: 'Food & Cooking', icon: Coffee },
    { id: 'reading', label: 'Reading & Learning', icon: BookOpen },
    { id: 'volunteering', label: 'Volunteering & Community', icon: Users }
  ]
}

const CAUSE_CATEGORIES = [
  { id: 'environment', label: 'Environmental Protection', icon: Globe },
  { id: 'education', label: 'Education & Learning', icon: GraduationCap },
  { id: 'healthcare', label: 'Healthcare & Medical', icon: Heart },
  { id: 'social-justice', label: 'Social Justice & Equality', icon: Users },
  { id: 'technology-access', label: 'Technology Access & Digital Divide', icon: Wifi },
  { id: 'mental-health', label: 'Mental Health & Wellness', icon: Heart },
  { id: 'poverty', label: 'Poverty Alleviation', icon: Home },
  { id: 'human-rights', label: 'Human Rights & Advocacy', icon: Shield }
]

interface LinkedOutOnboardingProps {
  onComplete: (profile: UserProfile) => void
  onSkip: () => void
}

export function LinkedOutOnboarding({ onComplete, onSkip }: LinkedOutOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    location: '',
    timezone: '',
    currentRole: '',
    company: '',
    industry: '',
    experienceLevel: 'mid',
    careerGoals: [],
    skillGoals: [],
    projectGoals: [],
    learningGoals: [],
    interests: [],
    causes: [],
    hobbies: [],
    networkingStyle: 'ambivert',
    preferredPlatforms: [],
    communicationStyle: 'mixed',
    privacyLevel: 'professional',
    dataSharing: true,
    securityPreferences: []
  })

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to LinkedOut',
      description: 'Let\'s set up your professional networking profile',
      component: <WelcomeStep />,
      isCompleted: false
    },
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Tell us about yourself',
      component: <BasicInfoStep profile={profile} setProfile={setProfile} />,
      isCompleted: false
    },
    {
      id: 'professional',
      title: 'Professional Background',
      description: 'Your career and experience',
      component: <ProfessionalStep profile={profile} setProfile={setProfile} />,
      isCompleted: false
    },
    {
      id: 'aspirations',
      title: 'Your Aspirations',
      description: 'What are your goals and ambitions?',
      component: <AspirationsStep profile={profile} setProfile={setProfile} />,
      isCompleted: false
    },
    {
      id: 'interests',
      title: 'Interests & Causes',
      description: 'What drives and inspires you?',
      component: <InterestsStep profile={profile} setProfile={setProfile} />,
      isCompleted: false
    },
    {
      id: 'networking',
      title: 'Networking Preferences',
      description: 'How do you like to connect?',
      component: <NetworkingStep profile={profile} setProfile={setProfile} />,
      isCompleted: false
    },
    {
      id: 'security',
      title: 'Privacy & Security',
      description: 'Your data protection preferences',
      component: <SecurityStep profile={profile} setProfile={setProfile} />,
      isCompleted: false
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'Welcome to your professional network',
      component: <CompleteStep profile={profile} />,
      isCompleted: false
    }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(profile)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to LinkedOut
          </h1>
          <p className="text-xl text-gray-600">
            Your AI-powered professional networking platform
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
            <CardDescription className="text-lg">
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {steps[currentStep].component}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex space-x-2">
            <Button variant="ghost" onClick={onSkip}>
              Skip Setup
            </Button>
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Components
function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
        <Network className="h-12 w-12 text-white" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Transform Your Professional Network
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          LinkedOut is more than just another networking platform. We use AI to connect you with 
          professionals who share your aspirations, help you achieve your goals, and build meaningful 
          relationships that matter.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Aspiration-Based</h4>
          <p className="text-sm text-gray-600">Connect based on future goals, not past achievements</p>
        </div>
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900">AI-Powered</h4>
          <p className="text-sm text-gray-600">Intelligent matching and personalized recommendations</p>
        </div>
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Community-Focused</h4>
          <p className="text-sm text-gray-600">Join tribes and build meaningful professional relationships</p>
        </div>
      </div>
    </div>
  )
}

function BasicInfoStep({ profile, setProfile }: { profile: UserProfile, setProfile: (profile: UserProfile) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <Input
            placeholder="Enter your full name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Location</label>
          <Input
            placeholder="City, Country"
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Timezone</label>
          <Select value={profile.timezone} onValueChange={(value) => setProfile({ ...profile, timezone: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC-12">UTC-12 (Baker Island)</SelectItem>
              <SelectItem value="UTC-8">UTC-8 (Pacific Time)</SelectItem>
              <SelectItem value="UTC-5">UTC-5 (Eastern Time)</SelectItem>
              <SelectItem value="UTC-0">UTC+0 (GMT)</SelectItem>
              <SelectItem value="UTC+1">UTC+1 (Central European)</SelectItem>
              <SelectItem value="UTC+5:30">UTC+5:30 (India)</SelectItem>
              <SelectItem value="UTC+8">UTC+8 (China)</SelectItem>
              <SelectItem value="UTC+9">UTC+9 (Japan)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function ProfessionalStep({ profile, setProfile }: { profile: UserProfile, setProfile: (profile: UserProfile) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Current Role</label>
          <Input
            placeholder="e.g., Software Engineer, Product Manager"
            value={profile.currentRole}
            onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Company</label>
          <Input
            placeholder="Your current company"
            value={profile.company}
            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Industry</label>
          <Select value={profile.industry} onValueChange={(value) => setProfile({ ...profile, industry: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Experience Level</label>
          <Select value={profile.experienceLevel} onValueChange={(value) => setProfile({ ...profile, experienceLevel: value as any })}>
            <SelectTrigger>
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
              <SelectItem value="mid">Mid Level (3-7 years)</SelectItem>
              <SelectItem value="senior">Senior Level (8-15 years)</SelectItem>
              <SelectItem value="executive">Executive Level (15+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function AspirationsStep({ profile, setProfile }: { profile: UserProfile, setProfile: (profile: UserProfile) => void }) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const goalCategories = [
    { id: 'career', label: 'Career Goals', icon: Briefcase, goals: [
      'Become a team lead', 'Start my own company', 'Transition to a new industry',
      'Get promoted to senior role', 'Build a personal brand', 'Mentor others'
    ]},
    { id: 'skills', label: 'Skill Development', icon: GraduationCap, goals: [
      'Learn AI/ML', 'Master a new programming language', 'Improve public speaking',
      'Develop leadership skills', 'Learn data analysis', 'Improve design skills'
    ]},
    { id: 'projects', label: 'Project Goals', icon: Target, goals: [
      'Launch a side project', 'Contribute to open source', 'Build a mobile app',
      'Create a blog', 'Develop a SaaS product', 'Organize a conference'
    ]},
    { id: 'learning', label: 'Learning Goals', icon: BookOpen, goals: [
      'Get a certification', 'Complete an online course', 'Read industry books',
      'Attend conferences', 'Join a study group', 'Learn from mentors'
    ]}
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">What are your professional aspirations?</h3>
        <p className="text-gray-600">Select goals that resonate with you. This helps us connect you with the right people.</p>
      </div>

      <div className="space-y-6">
        {goalCategories.map((category) => (
          <div key={category.id} className="space-y-3">
            <div className="flex items-center space-x-2">
              <category.icon className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">{category.label}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {category.goals.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={selectedGoals.includes(goal)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedGoals([...selectedGoals, goal])
                        setProfile({ ...profile, careerGoals: [...profile.careerGoals, goal] })
                      } else {
                        setSelectedGoals(selectedGoals.filter(g => g !== goal))
                        setProfile({ ...profile, careerGoals: profile.careerGoals.filter(g => g !== goal) })
                      }
                    }}
                  />
                  <label htmlFor={goal} className="text-sm text-gray-700 cursor-pointer">
                    {goal}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InterestsStep({ profile, setProfile }: { profile: UserProfile, setProfile: (profile: UserProfile) => void }) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedCauses, setSelectedCauses] = useState<string[]>([])

  return (
    <div className="space-y-8">
      {/* Interests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Interests</h3>
        <p className="text-gray-600">What topics and activities interest you?</p>
        
        {Object.entries(INTEREST_CATEGORIES).map(([category, interests]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {interests.map((interest) => (
                <div key={interest.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest.id}
                    checked={selectedInterests.includes(interest.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedInterests([...selectedInterests, interest.id])
                        setProfile({ ...profile, interests: [...profile.interests, interest.label] })
                      } else {
                        setSelectedInterests(selectedInterests.filter(i => i !== interest.id))
                        setProfile({ ...profile, interests: profile.interests.filter(i => i !== interest.label) })
                      }
                    }}
                  />
                  <label htmlFor={interest.id} className="text-sm text-gray-700 cursor-pointer">
                    {interest.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Causes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Causes You Care About</h3>
        <p className="text-gray-600">What social causes are important to you?</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CAUSE_CATEGORIES.map((cause) => (
            <div key={cause.id} className="flex items-center space-x-2">
              <Checkbox
                id={cause.id}
                checked={selectedCauses.includes(cause.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCauses([...selectedCauses, cause.id])
                    setProfile({ ...profile, causes: [...profile.causes, cause.label] })
                  } else {
                    setSelectedCauses(selectedCauses.filter(c => c !== cause.id))
                    setProfile({ ...profile, causes: profile.causes.filter(c => c !== cause.label) })
                  }
                }}
              />
              <label htmlFor={cause.id} className="text-sm text-gray-700 cursor-pointer">
                {cause.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NetworkingStep({ profile, setProfile }: { profile: UserProfile, setProfile: (profile: UserProfile) => void }) {
  const platforms = [
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { id: 'twitter', label: 'Twitter', icon: Twitter },
    { id: 'facebook', label: 'Facebook', icon: Facebook },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'github', label: 'GitHub', icon: Github }
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Networking Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'introvert', label: 'Introvert', description: 'Prefer small groups and deep conversations' },
            { id: 'ambivert', label: 'Ambivert', description: 'Balance between social and quiet time' },
            { id: 'extrovert', label: 'Extrovert', description: 'Thrive in large groups and networking events' }
          ].map((style) => (
            <div
              key={style.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                profile.networkingStyle === style.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setProfile({ ...profile, networkingStyle: style.id as any })}
            >
              <h4 className="font-medium text-gray-900">{style.label}</h4>
              <p className="text-sm text-gray-600">{style.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Preferred Platforms</h3>
        <p className="text-gray-600">Which platforms do you use for professional networking?</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {platforms.map((platform) => (
            <div key={platform.id} className="flex items-center space-x-2">
              <Checkbox
                id={platform.id}
                checked={profile.preferredPlatforms.includes(platform.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setProfile({ ...profile, preferredPlatforms: [...profile.preferredPlatforms, platform.id] })
                  } else {
                    setProfile({ ...profile, preferredPlatforms: profile.preferredPlatforms.filter(p => p !== platform.id) })
                  }
                }}
              />
              <platform.icon className="h-4 w-4" />
              <label htmlFor={platform.id} className="text-sm text-gray-700 cursor-pointer">
                {platform.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Communication Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'formal', label: 'Formal', description: 'Professional and structured communication' },
            { id: 'casual', label: 'Casual', description: 'Relaxed and friendly communication' },
            { id: 'mixed', label: 'Mixed', description: 'Adapt based on context and relationship' }
          ].map((style) => (
            <div
              key={style.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                profile.communicationStyle === style.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setProfile({ ...profile, communicationStyle: style.id as any })}
            >
              <h4 className="font-medium text-gray-900">{style.label}</h4>
              <p className="text-sm text-gray-600">{style.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SecurityStep({ profile, setProfile }: { profile: UserProfile, setProfile: (profile: UserProfile) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Privacy Level</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'public', label: 'Public', description: 'Visible to everyone on the platform' },
            { id: 'professional', label: 'Professional', description: 'Visible to professional connections only' },
            { id: 'private', label: 'Private', description: 'Visible only to close connections' }
          ].map((level) => (
            <div
              key={level.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                profile.privacyLevel === level.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setProfile({ ...profile, privacyLevel: level.id as any })}
            >
              <h4 className="font-medium text-gray-900">{level.label}</h4>
              <p className="text-sm text-gray-600">{level.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Data Sharing</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="data-sharing"
            checked={profile.dataSharing}
            onCheckedChange={(checked) => setProfile({ ...profile, dataSharing: checked as boolean })}
          />
          <label htmlFor="data-sharing" className="text-sm text-gray-700 cursor-pointer">
            Allow LinkedOut to use my data to improve AI recommendations and matching
          </label>
        </div>
        <p className="text-xs text-gray-500">
          Your data is always encrypted and never shared with third parties. This helps us provide better 
          recommendations and connect you with the right people.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Security Preferences</h3>
        <div className="space-y-3">
          {[
            { id: 'two-factor', label: 'Two-Factor Authentication', description: 'Extra security for your account' },
            { id: 'encrypted-messaging', label: 'Encrypted Messaging', description: 'All messages are end-to-end encrypted' },
            { id: 'secure-storage', label: 'Secure File Storage', description: 'Files are encrypted and securely stored' },
            { id: 'audit-logs', label: 'Activity Audit Logs', description: 'Track all account activity' }
          ].map((pref) => (
            <div key={pref.id} className="flex items-center space-x-2">
              <Checkbox
                id={pref.id}
                checked={profile.securityPreferences.includes(pref.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setProfile({ ...profile, securityPreferences: [...profile.securityPreferences, pref.id] })
                  } else {
                    setProfile({ ...profile, securityPreferences: profile.securityPreferences.filter(p => p !== pref.id) })
                  }
                }}
              />
              <div>
                <label htmlFor={pref.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                  {pref.label}
                </label>
                <p className="text-xs text-gray-500">{pref.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CompleteStep({ profile }: { profile: UserProfile }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
        <Check className="h-12 w-12 text-white" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-gray-900">
          Welcome to LinkedOut, {profile.name}!
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your profile is set up and ready to go. We're already working on finding the perfect connections 
          and tribes for you based on your aspirations and interests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Find Your Tribe</h4>
          <p className="text-sm text-gray-600">Join communities that share your aspirations</p>
        </div>
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
            <Network className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Smart Connections</h4>
          <p className="text-sm text-gray-600">AI-powered professional networking</p>
        </div>
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center">
            <Target className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900">Achieve Goals</h4>
          <p className="text-sm text-gray-600">Track progress and get support</p>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">What's Next?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• We'll analyze your profile and find matching professionals</li>
          <li>• Join tribes based on your interests and aspirations</li>
          <li>• Start conversations with AI-generated conversation starters</li>
          <li>• Track your professional goals and get support from your network</li>
        </ul>
      </div>
    </div>
  )
}
