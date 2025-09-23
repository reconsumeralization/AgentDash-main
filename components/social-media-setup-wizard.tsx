"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Checkbox,
} from "@/components/ui/checkbox"
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Info,
  BookOpen,
  Video,
  FileText,
  Settings,
  Zap,
  Shield,
  Clock,
  Users,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Play,
  Download,
  Link,
  Mail,
  Phone,
  Globe,
  Building2,
  User,
  Key,
  Lock,
  Unlock,
  RefreshCw,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface PlatformSetup {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
  requirements: string[]
  benefits: string[]
  isConnected: boolean
  isInProgress: boolean
  credentials?: {
    clientId?: string
    clientSecret?: string
    redirectUri?: string
    apiKey?: string
    bearerToken?: string
    appId?: string
    appSecret?: string
  }
  setupSteps: SetupStep[]
  documentation: {
    apiDocs: string
    setupGuide: string
    videoTutorial?: string
    sampleCode?: string
  }
}

interface SetupStep {
  id: string
  title: string
  description: string
  type: 'info' | 'form' | 'verification' | 'test'
  fields?: Array<{
    name: string
    label: string
    type: 'text' | 'password' | 'url' | 'email'
    required: boolean
    placeholder?: string
    helpText?: string
  }>
  instructions?: string[]
  verificationUrl?: string
  testEndpoint?: string
}

export function SocialMediaSetupWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformSetup | null>(null)
  const [setupProgress, setSetupProgress] = useState<Record<string, number>>({})
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({})
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'idle' | 'connecting' | 'success' | 'error'>>({})

  const platforms: PlatformSetup[] = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Professional networking and B2B content',
      icon: <Linkedin className="h-6 w-6" />,
      color: '#0077B5',
      category: 'Professional',
      difficulty: 'medium',
      estimatedTime: '10-15 minutes',
      requirements: ['LinkedIn Developer Account', 'Business Verification'],
      benefits: ['Professional networking', 'B2B content sharing', 'Company page management', 'Lead generation'],
      isConnected: false,
      isInProgress: false,
      setupSteps: [
        {
          id: 'create-app',
          title: 'Create LinkedIn App',
          description: 'Set up your LinkedIn application in the LinkedIn Developer Portal',
          type: 'info',
          instructions: [
            'Go to LinkedIn Developer Portal',
            'Click "Create App"',
            'Fill in app details (name, description, logo)',
            'Add redirect URLs',
            'Request necessary permissions'
          ],
          verificationUrl: 'https://www.linkedin.com/developers/'
        },
        {
          id: 'get-credentials',
          title: 'Get API Credentials',
          description: 'Retrieve your Client ID and Client Secret',
          type: 'form',
          fields: [
            {
              name: 'clientId',
              label: 'Client ID',
              type: 'text',
              required: true,
              placeholder: 'Enter your LinkedIn Client ID',
              helpText: 'Found in your LinkedIn app settings'
            },
            {
              name: 'clientSecret',
              label: 'Client Secret',
              type: 'password',
              required: true,
              placeholder: 'Enter your LinkedIn Client Secret',
              helpText: 'Keep this secure and never share it publicly'
            },
            {
              name: 'redirectUri',
              label: 'Redirect URI',
              type: 'url',
              required: true,
              placeholder: 'https://yourapp.com/auth/linkedin/callback',
              helpText: 'Must match the redirect URI in your LinkedIn app settings'
            }
          ]
        },
        {
          id: 'test-connection',
          title: 'Test Connection',
          description: 'Verify your credentials work correctly',
          type: 'test',
          testEndpoint: '/api/social-media/test/linkedin'
        }
      ],
      documentation: {
        apiDocs: 'https://docs.microsoft.com/en-us/linkedin/',
        setupGuide: 'https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication',
        videoTutorial: 'https://youtube.com/watch?v=linkedin-setup',
        sampleCode: 'https://github.com/example/linkedin-integration'
      }
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      description: 'Real-time social media and news',
      icon: <Twitter className="h-6 w-6" />,
      color: '#1DA1F2',
      category: 'Social',
      difficulty: 'easy',
      estimatedTime: '5-10 minutes',
      requirements: ['Twitter Developer Account', 'API Access'],
      benefits: ['Real-time posting', 'Trend monitoring', 'Engagement tracking', 'Direct messaging'],
      isConnected: false,
      isInProgress: false,
      setupSteps: [
        {
          id: 'apply-access',
          title: 'Apply for API Access',
          description: 'Request access to Twitter API v2',
          type: 'info',
          instructions: [
            'Go to Twitter Developer Portal',
            'Apply for API access',
            'Choose appropriate access level',
            'Complete application review',
            'Wait for approval (can take 1-7 days)'
          ],
          verificationUrl: 'https://developer.twitter.com/'
        },
        {
          id: 'create-app',
          title: 'Create Twitter App',
          description: 'Set up your Twitter application',
          type: 'info',
          instructions: [
            'Create a new app in your developer dashboard',
            'Configure app settings',
            'Set up authentication',
            'Generate API keys'
          ]
        },
        {
          id: 'get-credentials',
          title: 'Get API Credentials',
          description: 'Retrieve your API keys and tokens',
          type: 'form',
          fields: [
            {
              name: 'apiKey',
              label: 'API Key',
              type: 'text',
              required: true,
              placeholder: 'Enter your Twitter API Key'
            },
            {
              name: 'apiSecret',
              label: 'API Secret',
              type: 'password',
              required: true,
              placeholder: 'Enter your Twitter API Secret'
            },
            {
              name: 'bearerToken',
              label: 'Bearer Token',
              type: 'password',
              required: true,
              placeholder: 'Enter your Twitter Bearer Token'
            }
          ]
        }
      ],
      documentation: {
        apiDocs: 'https://developer.twitter.com/en/docs',
        setupGuide: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0',
        videoTutorial: 'https://youtube.com/watch?v=twitter-setup'
      }
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Social networking and community building',
      icon: <Facebook className="h-6 w-6" />,
      color: '#1877F2',
      category: 'Social',
      difficulty: 'hard',
      estimatedTime: '20-30 minutes',
      requirements: ['Facebook Developer Account', 'Business Verification', 'App Review'],
      benefits: ['Page management', 'Community building', 'Advertising integration', 'Analytics'],
      isConnected: false,
      isInProgress: false,
      setupSteps: [
        {
          id: 'create-app',
          title: 'Create Facebook App',
          description: 'Set up your Facebook application',
          type: 'info',
          instructions: [
            'Go to Facebook Developers',
            'Create a new app',
            'Choose "Business" as app type',
            'Configure basic settings',
            'Add Facebook Login product'
          ],
          verificationUrl: 'https://developers.facebook.com/'
        },
        {
          id: 'business-verification',
          title: 'Business Verification',
          description: 'Complete business verification process',
          type: 'info',
          instructions: [
            'Submit business documents',
            'Verify business address',
            'Complete identity verification',
            'Wait for approval (1-3 business days)'
          ]
        },
        {
          id: 'app-review',
          title: 'App Review',
          description: 'Submit your app for review',
          type: 'info',
          instructions: [
            'Prepare app for review',
            'Submit required permissions',
            'Provide use case documentation',
            'Wait for review (1-7 days)'
          ]
        },
        {
          id: 'get-credentials',
          title: 'Get API Credentials',
          description: 'Retrieve your App ID and App Secret',
          type: 'form',
          fields: [
            {
              name: 'appId',
              label: 'App ID',
              type: 'text',
              required: true,
              placeholder: 'Enter your Facebook App ID'
            },
            {
              name: 'appSecret',
              label: 'App Secret',
              type: 'password',
              required: true,
              placeholder: 'Enter your Facebook App Secret'
            }
          ]
        }
      ],
      documentation: {
        apiDocs: 'https://developers.facebook.com/docs/graph-api',
        setupGuide: 'https://developers.facebook.com/docs/facebook-login',
        videoTutorial: 'https://youtube.com/watch?v=facebook-setup'
      }
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Visual content and storytelling',
      icon: <Instagram className="h-6 w-6" />,
      color: '#E4405F',
      category: 'Visual',
      difficulty: 'hard',
      estimatedTime: '15-25 minutes',
      requirements: ['Facebook Page', 'Instagram Business Account', 'Facebook App'],
      benefits: ['Visual content sharing', 'Story management', 'IGTV support', 'Shopping integration'],
      isConnected: false,
      isInProgress: false,
      setupSteps: [
        {
          id: 'business-account',
          title: 'Convert to Business Account',
          description: 'Convert your Instagram to a business account',
          type: 'info',
          instructions: [
            'Open Instagram app',
            'Go to Settings > Account',
            'Switch to Professional Account',
            'Choose Business account type',
            'Connect to Facebook Page'
          ]
        },
        {
          id: 'facebook-app',
          title: 'Set up Facebook App',
          description: 'Create or use existing Facebook app',
          type: 'info',
          instructions: [
            'Use the same Facebook app from Facebook setup',
            'Add Instagram Basic Display product',
            'Configure Instagram settings',
            'Get Instagram App ID'
          ]
        },
        {
          id: 'get-credentials',
          title: 'Get Instagram Credentials',
          description: 'Retrieve your Instagram API credentials',
          type: 'form',
          fields: [
            {
              name: 'appId',
              label: 'Instagram App ID',
              type: 'text',
              required: true,
              placeholder: 'Enter your Instagram App ID'
            },
            {
              name: 'appSecret',
              label: 'Instagram App Secret',
              type: 'password',
              required: true,
              placeholder: 'Enter your Instagram App Secret'
            }
          ]
        }
      ],
      documentation: {
        apiDocs: 'https://developers.facebook.com/docs/instagram-api',
        setupGuide: 'https://developers.facebook.com/docs/instagram-basic-display-api',
        videoTutorial: 'https://youtube.com/watch?v=instagram-setup'
      }
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy'
      case 'medium': return 'Medium'
      case 'hard': return 'Hard'
      default: return 'Unknown'
    }
  }

  const handlePlatformSelect = (platform: PlatformSetup) => {
    setSelectedPlatform(platform)
    setCurrentStep(0)
  }

  const handleNextStep = () => {
    if (selectedPlatform && currentStep < selectedPlatform.setupSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConnect = async (platformId: string) => {
    setIsConnecting(true)
    setConnectionStatus(prev => ({ ...prev, [platformId]: 'connecting' }))
    
    try {
      // Mock connection process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setConnectionStatus(prev => ({ ...prev, [platformId]: 'success' }))
      setSetupProgress(prev => ({ ...prev, [platformId]: 100 }))
      
      // Update platform connection status
      const platform = platforms.find(p => p.id === platformId)
      if (platform) {
        platform.isConnected = true
        platform.isInProgress = false
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [platformId]: 'error' }))
    } finally {
      setIsConnecting(false)
    }
  }

  const toggleCredentialsVisibility = (platformId: string) => {
    setShowCredentials(prev => ({ ...prev, [platformId]: !prev[platformId] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (selectedPlatform) {
    const currentSetupStep = selectedPlatform.setupSteps[currentStep]
    const progress = ((currentStep + 1) / selectedPlatform.setupSteps.length) * 100

    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPlatform(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Platforms
            </Button>
            <div className="flex items-center gap-3">
              {selectedPlatform.icon}
              <div>
                <h1 className="text-2xl font-bold">{selectedPlatform.name} Setup</h1>
                <p className="text-gray-600">{selectedPlatform.description}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <Badge className={getDifficultyColor(selectedPlatform.difficulty)}>
              {getDifficultyText(selectedPlatform.difficulty)}
            </Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {selectedPlatform.estimatedTime}
            </Badge>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {selectedPlatform.category}
            </Badge>
          </div>

          <Progress value={progress} className="mb-4" />
          <p className="text-sm text-gray-600">
            Step {currentStep + 1} of {selectedPlatform.setupSteps.length}: {currentSetupStep.title}
          </p>
        </div>

        {/* Setup Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Setup Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedPlatform.setupSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      index === currentStep
                        ? 'bg-blue-50 border border-blue-200'
                        : index < currentStep
                        ? 'bg-green-50 border border-green-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index < currentStep ? <CheckCircle className="h-3 w-3" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  API Documentation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Setup Guide
                </Button>
                {selectedPlatform.documentation.videoTutorial && (
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Video className="h-4 w-4 mr-2" />
                    Video Tutorial
                  </Button>
                )}
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Sample Code
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{currentSetupStep.title}</CardTitle>
                <CardDescription>{currentSetupStep.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentSetupStep.type === 'info' && (
                  <div className="space-y-4">
                    {currentSetupStep.instructions && (
                      <div>
                        <h4 className="font-medium mb-3">Instructions:</h4>
                        <ol className="space-y-2">
                          {currentSetupStep.instructions.map((instruction, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-sm">{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    
                    {currentSetupStep.verificationUrl && (
                      <Alert>
                        <ExternalLink className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span>Click to open the setup page</span>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {currentSetupStep.type === 'form' && (
                  <div className="space-y-4">
                    {currentSetupStep.fields?.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="relative">
                          <Input
                            id={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            className={field.type === 'password' ? 'pr-10' : ''}
                          />
                          {field.type === 'password' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => toggleCredentialsVisibility(field.name)}
                            >
                              {showCredentials[field.name] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        {field.helpText && (
                          <p className="text-sm text-gray-600">{field.helpText}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentSetupStep.type === 'test' && (
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        This will test your API credentials to ensure they work correctly.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => handleConnect(selectedPlatform.id)}
                        disabled={isConnecting}
                        className="flex-1"
                      >
                        {isConnecting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Testing Connection...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Test Connection
                          </>
                        )}
                      </Button>
                    </div>

                    {connectionStatus[selectedPlatform.id] === 'success' && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Connection successful! Your {selectedPlatform.name} integration is ready to use.
                        </AlertDescription>
                      </Alert>
                    )}

                    {connectionStatus[selectedPlatform.id] === 'error' && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          Connection failed. Please check your credentials and try again.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {currentStep === selectedPlatform.setupSteps.length - 1 ? (
                      <Button
                        onClick={() => handleConnect(selectedPlatform.id)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Setup
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={handleNextStep}>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Connect Your Social Media Platforms</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Set up integrations with your favorite social media platforms to manage all your content from one place.
        </p>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              platform.isConnected ? 'ring-2 ring-green-200 bg-green-50/30' : ''
            }`}
            onClick={() => handlePlatformSelect(platform)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ color: platform.color }}>
                    {platform.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    <CardDescription>{platform.description}</CardDescription>
                  </div>
                </div>
                {platform.isConnected ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Button size="sm" variant="outline">
                    Setup
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(platform.difficulty)}>
                  {getDifficultyText(platform.difficulty)}
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {platform.estimatedTime}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {platform.requirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Benefits:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {platform.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-blue-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {platform.isConnected && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully connected! You can now manage your {platform.name} content.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Need Help Getting Started?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">Documentation</h3>
              <p className="text-sm text-gray-600 mb-3">
                Comprehensive guides for each platform integration
              </p>
              <Button variant="outline" size="sm">
                View Docs
              </Button>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">Video Tutorials</h3>
              <p className="text-sm text-gray-600 mb-3">
                Step-by-step video guides for each platform
              </p>
              <Button variant="outline" size="sm">
                Watch Videos
              </Button>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium mb-2">Support</h3>
              <p className="text-sm text-gray-600 mb-3">
                Get help from our support team
              </p>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
