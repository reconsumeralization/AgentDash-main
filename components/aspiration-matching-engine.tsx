"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Progress } from "@/components/ui"
import {
  Brain,
  Target,
  Users,
  MessageCircle,
  Star,
  Heart,
  Network,
  Sparkles,
  Activity,
  ArrowRight,
  CheckCircle
} from "lucide-react"

interface AspirationProfile {
  id: string
  userId: string
  aspirations: {
    category: string
    description: string
    priority: number
    timeline: string
    skills: string[]
    resources: string[]
    collaborators: string[]
  }[]
  skills: {
    current: string[]
    learning: string[]
    teaching: string[]
  }
  causes: string[]
  learning: string[]
  collaborationStyle: string
  availability: string
  location: string
  experience: string
}

interface MatchResult {
  userId: string
  name: string
  title: string
  company: string
  matchScore: number
  sharedAspirations: string[]
  complementarySkills: string[]
  collaborationPotential: number
  sharedCauses: string[]
  learningAlignment: string[]
  reasons: string[]
  nextSteps: string[]
}

interface TribeRecommendation {
  id: string
  name: string
  description: string
  members: number
  sharedAspirations: string[]
  collaborationHistory: number
  growthRate: number
  fitScore: number
  benefits: string[]
}

export function AspirationMatchingEngine() {
  const [userProfile, _setUserProfile] = useState<AspirationProfile>({
    id: 'user-1',
    userId: 'current-user',
    aspirations: [
      {
        category: 'Career',
        description: 'Transition to AI Product Management in Climate Tech',
        priority: 95,
        timeline: '12 months',
        skills: ['Product Strategy', 'AI/ML', 'Climate Tech'],
        resources: ['PM Course', 'Climate Network', 'AI Mentors'],
        collaborators: ['Climate PMs', 'AI Researchers', 'Sustainability Experts']
      },
      {
        category: 'Learning',
        description: 'Master Python for AI and Machine Learning',
        priority: 85,
        timeline: '6 months',
        skills: ['Python', 'Machine Learning', 'Data Science'],
        resources: ['Online Courses', 'Coding Bootcamp', 'ML Community'],
        collaborators: ['AI Researchers', 'Data Scientists', 'ML Engineers']
      }
    ],
    skills: {
      current: ['Product Management', 'User Research', 'Stakeholder Management'],
      learning: ['Python', 'Machine Learning', 'Climate Tech'],
      teaching: ['Product Strategy', 'User Experience', 'Team Leadership']
    },
    causes: ['Climate Action', 'AI Ethics', 'Digital Inclusion'],
    learning: ['Python', 'Machine Learning', 'Climate Tech', 'AI Ethics'],
    collaborationStyle: 'Collaborative and Mentorship-focused',
    availability: 'Evenings and Weekends',
    location: 'Remote',
    experience: '5+ years in Product Management'
  })

  const [matches, _setMatches] = useState<MatchResult[]>([
    {
      userId: 'match-1',
      name: 'Dr. Elena Rodriguez',
      title: 'AI Research Scientist',
      company: 'GreenTech Labs',
      matchScore: 94,
      sharedAspirations: ['AI Ethics', 'Climate Tech', 'Product Innovation'],
      complementarySkills: ['Machine Learning', 'Research', 'AI Ethics'],
      collaborationPotential: 91,
      sharedCauses: ['Climate Action', 'AI Ethics'],
      learningAlignment: ['Python', 'Machine Learning', 'AI Ethics'],
      reasons: [
        'Both passionate about AI ethics and climate tech',
        'Complementary skills in research and product management',
        'Shared learning goals in Python and ML',
        'Strong collaboration history in sustainability projects'
      ],
      nextSteps: [
        'Connect via LinkedIn to discuss climate tech opportunities',
        'Join the AI Ethics in Climate Tech study group',
        'Collaborate on a climate impact measurement project'
      ]
    },
    {
      userId: 'match-2',
      name: 'Marcus Chen',
      title: 'Climate Tech Product Manager',
      company: 'EcoFlow Solutions',
      matchScore: 89,
      sharedAspirations: ['Climate Tech Leadership', 'Sustainable Product Development'],
      complementarySkills: ['Climate Tech', 'Sustainability Metrics', 'Green Finance'],
      collaborationPotential: 87,
      sharedCauses: ['Climate Action', 'Sustainable Development'],
      learningAlignment: ['Climate Tech', 'Sustainability'],
      reasons: [
        'Both transitioning to climate tech product management',
        'Shared passion for sustainable product development',
        'Complementary experience in different aspects of climate tech',
        'Both learning about sustainability metrics and green finance'
      ],
      nextSteps: [
        'Share resources on climate tech product management',
        'Join the Climate Tech PM community together',
        'Collaborate on a sustainability metrics framework'
      ]
    }
  ])

  const [tribes, _setTribes] = useState<TribeRecommendation[]>([
    {
      id: 'tribe-1',
      name: 'Climate Tech Innovators',
      description: 'Product managers and researchers building sustainable solutions',
      members: 127,
      sharedAspirations: ['Climate Tech', 'Sustainable Development', 'AI for Good'],
      collaborationHistory: 89,
      growthRate: 34,
      fitScore: 92,
      benefits: [
        'Weekly climate tech case studies',
        'Monthly guest speakers from leading companies',
        'Collaborative projects with real impact',
        'Access to climate tech job board'
      ]
    },
    {
      id: 'tribe-2',
      name: 'AI Ethics Collective',
      description: 'Professionals ensuring AI development is ethical and inclusive',
      members: 89,
      sharedAspirations: ['AI Ethics', 'Responsible AI', 'Inclusive Technology'],
      collaborationHistory: 76,
      growthRate: 28,
      fitScore: 87,
      benefits: [
        'AI ethics framework development',
        'Responsible AI certification program',
        'Inclusive design workshops',
        'Ethics review board participation'
      ]
    }
  ])

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const analyzeProfile = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate AI analysis
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setAnalysisProgress(i)
    }

    setIsAnalyzing(false)
  }

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getFitColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Aspiration Matching Engine
          </h2>
          <p className="text-muted-foreground">
            Powered by Coral Protocol agents for intelligent professional matching
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Coral AI Powered
          </Badge>
          <Button 
            onClick={analyzeProfile} 
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Activity className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Analyze Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                <span className="font-medium text-blue-800">AI Agents Analyzing Your Profile...</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
              <div className="text-sm text-blue-600">
                Analyzing aspirations, skills, and collaboration potential... {analysisProgress}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Your Aspiration Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Top Aspirations:</div>
              {userProfile.aspirations.map((aspiration, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">{aspiration.description}</span>
                  <Badge variant="outline">{aspiration.priority}%</Badge>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Key Causes:</div>
              <div className="flex flex-wrap gap-1">
                {userProfile.causes.map((cause) => (
                  <Badge key={cause} variant="secondary">{cause}</Badge>
                ))}
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-3">Currently Learning:</div>
              <div className="flex flex-wrap gap-1">
                {userProfile.learning.map((skill) => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Matching Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          AI-Powered Matches
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {matches.map((match) => (
            <Card key={match.userId} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">
                        {match.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{match.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{match.title} at {match.company}</p>
                    </div>
                  </div>
                  <Badge className={getMatchColor(match.matchScore)}>
                    {match.matchScore}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Shared Aspirations:</div>
                  <div className="flex flex-wrap gap-1">
                    {match.sharedAspirations.map((aspiration) => (
                      <Badge key={aspiration} variant="secondary" className="text-xs">
                        {aspiration}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Complementary Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {match.complementarySkills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{match.collaborationPotential}%</div>
                    <div className="text-xs text-muted-foreground">Collaboration Potential</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{match.sharedCauses.length}</div>
                    <div className="text-xs text-muted-foreground">Shared Causes</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Why This Match:</div>
                  <ul className="text-xs space-y-1">
                    {match.reasons.slice(0, 2).map((reason, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                  <Button size="sm" className="flex-1">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tribe Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          Recommended Tribes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tribes.map((tribe) => (
            <Card key={tribe.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {tribe.name}
                  </CardTitle>
                  <Badge className={getFitColor(tribe.fitScore)}>
                    {tribe.fitScore}% Fit
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{tribe.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">{tribe.members}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{tribe.collaborationHistory}%</div>
                    <div className="text-xs text-muted-foreground">Collaboration</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">+{tribe.growthRate}%</div>
                    <div className="text-xs text-muted-foreground">Growth</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Shared Aspirations:</div>
                  <div className="flex flex-wrap gap-1">
                    {tribe.sharedAspirations.map((aspiration) => (
                      <Badge key={aspiration} variant="secondary" className="text-xs">
                        {aspiration}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Benefits:</div>
                  <ul className="text-xs space-y-1">
                    {tribe.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Join Tribe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
