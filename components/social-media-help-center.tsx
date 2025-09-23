"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
// Note: Accordion component not available, using alternative approach
import {
  BookOpen,
  Video,
  FileText,
  MessageSquare,
  Search,
  Filter,
  ExternalLink,
  Download,
  Copy,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  Globe,
  Building2,
  Settings,
  Zap,
  Shield,
  Lock,
  Unlock,
  RefreshCw,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  Image,
  Video as VideoIcon,
  File,
  Folder,
  Archive,
  Trash2,
  Edit,
  Plus,
  Minus,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Home,
  Menu,
  Grid,
  List,
  Calendar,
  Bell,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Trophy,
  Crown,
  Gem,
  Sparkles,
  Lightbulb,
  Rocket,
  Plane,
  Car,
  Bike,
  Gamepad2,
  Music,
  Headphones,
  Mic,
  Camera,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Watch,
  Tv,
  Radio,
  Speaker,
  Volume1,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  RotateCcw,
  RotateCw,
  FastForward,
  Rewind,
  StepBack,
  StepForward,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Diamond,
  Heart as HeartIcon,
  Star as StarIcon,
  Moon,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Flame,
  Snowflake,
  Umbrella,
  TreePine,
  TreeDeciduous,
  Flower,
  Leaf,
  Bug,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Mouse,
  Squirrel,
  Turtle,
  Snail,
  Code
} from "lucide-react"

interface HelpArticle {
  id: string
  title: string
  content: string
  category: string
  platform?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  tags: string[]
  lastUpdated: Date
  author: string
  views: number
  helpful: number
  notHelpful: number
  isBookmarked: boolean
  relatedArticles: string[]
}

interface VideoTutorial {
  id: string
  title: string
  description: string
  platform: string
  duration: string
  thumbnail: string
  url: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  views: number
  likes: number
  isWatched: boolean
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  platform?: string
  helpful: number
  notHelpful: number
  tags: string[]
}

export function SocialMediaHelpCenter() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [activeTab, setActiveTab] = useState('articles')
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([])

  const categories = [
    { id: 'all', name: 'All Categories', icon: <Grid className="h-4 w-4" /> },
    { id: 'getting-started', name: 'Getting Started', icon: <Rocket className="h-4 w-4" /> },
    { id: 'authentication', name: 'Authentication', icon: <Shield className="h-4 w-4" /> },
    { id: 'posting', name: 'Posting Content', icon: <Edit className="h-4 w-4" /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: <AlertCircle className="h-4 w-4" /> },
    { id: 'api', name: 'API Reference', icon: <Code className="h-4 w-4" /> },
    { id: 'integrations', name: 'Integrations', icon: <Link className="h-4 w-4" /> }
  ]

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: '🌐' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'youtube', name: 'YouTube', icon: '📺' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'pinterest', name: 'Pinterest', icon: '📌' },
    { id: 'reddit', name: 'Reddit', icon: '🤖' }
  ]

  const difficulties = [
    { id: 'all', name: 'All Levels', color: 'bg-gray-500' },
    { id: 'beginner', name: 'Beginner', color: 'bg-green-500' },
    { id: 'intermediate', name: 'Intermediate', color: 'bg-yellow-500' },
    { id: 'advanced', name: 'Advanced', color: 'bg-red-500' }
  ]

  const mockArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with LinkedIn API Integration',
      content: `# Getting Started with LinkedIn API Integration

LinkedIn's API allows you to integrate professional networking features into your application. This guide will walk you through the process of setting up your first LinkedIn integration.

## Prerequisites

Before you begin, make sure you have:
- A LinkedIn account
- A LinkedIn Developer account
- A business or organization to represent

## Step 1: Create a LinkedIn App

1. Go to the [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in your app details:
   - App name
   - LinkedIn Page (optional)
   - Privacy policy URL
   - App logo
4. Agree to the terms and create your app

## Step 2: Configure Your App

1. In your app dashboard, go to the "Auth" tab
2. Add your redirect URLs
3. Request the necessary permissions
4. Note down your Client ID and Client Secret

## Step 3: Implement OAuth Flow

The LinkedIn API uses OAuth 2.0 for authentication. Here's a basic implementation:

\`\`\`javascript
// Redirect user to LinkedIn authorization
const authUrl = \`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=\${CLIENT_ID}&redirect_uri=\${REDIRECT_URI}&state=\${STATE}&scope=\${SCOPES}\`;

// Handle the callback
app.get('/auth/linkedin/callback', (req, res) => {
  const { code, state } = req.query;
  
  // Exchange code for access token
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI
    })
  });
  
  const tokenData = await tokenResponse.json();
  // Store the access token securely
});
\`\`\`

## Step 4: Make API Calls

Once you have an access token, you can make API calls:

\`\`\`javascript
// Get user profile
const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'X-Restli-Protocol-Version': '2.0.0'
  }
});

const profile = await profileResponse.json();
\`\`\`

## Common Issues

### Rate Limiting
LinkedIn has rate limits on their API. Make sure to:
- Implement proper error handling
- Use exponential backoff for retries
- Monitor your API usage

### Permissions
Some endpoints require specific permissions. Make sure to:
- Request the correct scopes during OAuth
- Handle permission errors gracefully
- Inform users about required permissions

## Next Steps

- Explore the [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- Check out our [sample code repository](https://github.com/example/linkedin-integration)
- Join our [developer community](https://discord.gg/example)

## Support

If you need help:
- Check our [FAQ section](#faq)
- Contact our support team
- Join our Discord community`,
      category: 'getting-started',
      platform: 'linkedin',
      difficulty: 'beginner',
      estimatedTime: '15 minutes',
      tags: ['linkedin', 'api', 'oauth', 'authentication'],
      lastUpdated: new Date('2024-01-15'),
      author: 'John Doe',
      views: 1250,
      helpful: 89,
      notHelpful: 5,
      isBookmarked: false,
      relatedArticles: ['2', '3']
    },
    {
      id: '2',
      title: 'Twitter API v2 Authentication Guide',
      content: `# Twitter API v2 Authentication Guide

Twitter API v2 provides powerful tools for building applications that interact with Twitter. This guide covers the authentication process.

## Authentication Methods

Twitter API v2 supports several authentication methods:

### 1. OAuth 2.0 Bearer Token
Best for read-only operations and public data access.

### 2. OAuth 2.0 with PKCE
Recommended for client-side applications.

### 3. OAuth 1.0a
For applications that need to act on behalf of users.

## Getting Started

1. Apply for a Twitter Developer account
2. Create a new app in the Developer Portal
3. Generate your API keys and tokens
4. Choose the appropriate authentication method

## Implementation Examples

### Bearer Token Authentication
\`\`\`javascript
const response = await fetch('https://api.twitter.com/2/tweets/search/recent?query=javascript', {
  headers: {
    'Authorization': \`Bearer \${BEARER_TOKEN}\`
  }
});
\`\`\`

### OAuth 2.0 with PKCE
\`\`\`javascript
// Generate code verifier and challenge
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);

// Redirect to authorization URL
const authUrl = \`https://twitter.com/i/oauth2/authorize?response_type=code&client_id=\${CLIENT_ID}&redirect_uri=\${REDIRECT_URI}&scope=\${SCOPES}&code_challenge=\${codeChallenge}&code_challenge_method=S256\`;

// Handle callback and exchange code for token
\`\`\`

## Best Practices

- Store credentials securely
- Implement proper error handling
- Respect rate limits
- Use appropriate scopes
- Monitor API usage

## Troubleshooting

Common issues and solutions:
- Invalid credentials: Check your API keys
- Rate limit exceeded: Implement backoff strategy
- Permission denied: Verify your app permissions`,
      category: 'authentication',
      platform: 'twitter',
      difficulty: 'intermediate',
      estimatedTime: '20 minutes',
      tags: ['twitter', 'api', 'oauth', 'authentication'],
      lastUpdated: new Date('2024-01-10'),
      author: 'Jane Smith',
      views: 980,
      helpful: 76,
      notHelpful: 3,
      isBookmarked: false,
      relatedArticles: ['1', '4']
    }
  ]

  const mockVideos: VideoTutorial[] = [
    {
      id: '1',
      title: 'LinkedIn API Setup in 10 Minutes',
      description: 'Learn how to set up LinkedIn API integration from scratch',
      platform: 'linkedin',
      duration: '10:30',
      thumbnail: '/api/placeholder/300/200',
      url: 'https://youtube.com/watch?v=linkedin-setup',
      category: 'getting-started',
      difficulty: 'beginner',
      views: 15420,
      likes: 234,
      isWatched: false
    },
    {
      id: '2',
      title: 'Twitter API v2 Advanced Features',
      description: 'Explore advanced features of Twitter API v2',
      platform: 'twitter',
      duration: '25:45',
      thumbnail: '/api/placeholder/300/200',
      url: 'https://youtube.com/watch?v=twitter-advanced',
      category: 'api',
      difficulty: 'advanced',
      views: 8930,
      likes: 156,
      isWatched: false
    }
  ]

  const mockFAQs: FAQ[] = [
    {
      id: '1',
      question: 'How do I get started with social media API integration?',
      answer: 'Start by creating developer accounts for the platforms you want to integrate with. Each platform has its own developer portal where you can create apps and get API credentials.',
      category: 'getting-started',
      helpful: 45,
      notHelpful: 2,
      tags: ['getting-started', 'api', 'integration']
    },
    {
      id: '2',
      question: 'What are the rate limits for LinkedIn API?',
      answer: 'LinkedIn API has different rate limits depending on the endpoint and your app tier. Generally, you can make 100 requests per minute for most endpoints.',
      category: 'api',
      platform: 'linkedin',
      helpful: 32,
      notHelpful: 1,
      tags: ['linkedin', 'rate-limits', 'api']
    }
  ]

  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesPlatform = selectedPlatform === 'all' || article.platform === selectedPlatform
    const matchesDifficulty = selectedDifficulty === 'all' || article.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesPlatform && matchesDifficulty
  })

  const filteredVideos = mockVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory
    const matchesPlatform = selectedPlatform === 'all' || video.platform === selectedPlatform
    const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesPlatform && matchesDifficulty
  })

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesPlatform = selectedPlatform === 'all' || faq.platform === selectedPlatform
    
    return matchesSearch && matchesCategory && matchesPlatform
  })

  const handleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    )
  }

  const handleHelpful = (articleId: string, isHelpful: boolean) => {
    // Update helpful/not helpful counts
    console.log(`Article ${articleId} marked as ${isHelpful ? 'helpful' : 'not helpful'}`)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Beginner'
      case 'intermediate': return 'Intermediate'
      case 'advanced': return 'Advanced'
      default: return 'Unknown'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Help Center</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find answers, tutorials, and guides to help you integrate with social media platforms.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search help articles, videos, and FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.icon}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map(platform => (
                  <SelectItem key={platform.id} value={platform.id}>
                    <div className="flex items-center gap-2">
                      <span>{platform.icon}</span>
                      {platform.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty.id} value={difficulty.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${difficulty.color}`} />
                      {difficulty.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Articles List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Help Articles</CardTitle>
                  <CardDescription>
                    {filteredArticles.length} articles found
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedArticle?.id === article.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm line-clamp-2">{article.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookmark(article.id)
                          }}
                        >
                          <Bookmark className={`h-4 w-4 ${
                            bookmarkedArticles.includes(article.id) ? 'fill-current' : ''
                          }`} />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(article.difficulty)}>
                          {getDifficultyText(article.difficulty)}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {article.estimatedTime}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>{article.views} views</span>
                        <span>{article.helpful} helpful</span>
                        <span>{article.lastUpdated.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Article Content */}
            <div className="lg:col-span-2">
              {selectedArticle ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedArticle.title}</CardTitle>
                        <CardDescription>
                          By {selectedArticle.author} • {selectedArticle.lastUpdated.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBookmark(selectedArticle.id)}
                        >
                          <Bookmark className={`h-4 w-4 ${
                            bookmarkedArticles.includes(selectedArticle.id) ? 'fill-current' : ''
                          }`} />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br>') }} />
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t mt-6">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Was this article helpful?
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHelpful(selectedArticle.id, true)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Yes ({selectedArticle.helpful})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHelpful(selectedArticle.id, false)}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          No ({selectedArticle.notHelpful})
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {selectedArticle.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Article Selected</h3>
                    <p className="text-gray-600 text-center">
                      Select an article from the list to view its content.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="cursor-pointer" onClick={() => setSelectedVideo(video)}>
                <div className="relative">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-t-lg flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getDifficultyColor(video.difficulty)}>
                      {getDifficultyText(video.difficulty)}
                    </Badge>
                    <Badge variant="outline">
                      {video.platform}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{video.views.toLocaleString()} views</span>
                    <span>{video.likes} likes</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id} className="border rounded-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                  <div className="flex items-center gap-2">
                    {faq.platform && (
                      <Badge variant="outline" className="text-xs">
                        {faq.platform}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {faq.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{faq.answer}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {faq.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {faq.helpful}
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {faq.notHelpful}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Get help from our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone Support
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Response Times</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span>24 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Live Chat:</span>
                      <span>5 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span>Immediate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Community
                </CardTitle>
                <CardDescription>
                  Connect with other developers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Discord Community
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Stack Overflow
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    GitHub Discussions
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Community Stats</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Discord Members:</span>
                      <span>2,500+</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GitHub Stars:</span>
                      <span>1,200+</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stack Overflow:</span>
                      <span>500+ questions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Player Modal */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedVideo.title}</DialogTitle>
              <DialogDescription>{selectedVideo.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="h-16 w-16 mx-auto mb-4" />
                    <p>Video Player</p>
                    <p className="text-sm text-gray-400">Duration: {selectedVideo.duration}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className={getDifficultyColor(selectedVideo.difficulty)}>
                    {getDifficultyText(selectedVideo.difficulty)}
                  </Badge>
                  <Badge variant="outline">
                    {selectedVideo.platform}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {selectedVideo.views.toLocaleString()} views
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-1" />
                    {selectedVideo.likes}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
