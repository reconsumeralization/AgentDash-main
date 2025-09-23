"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Sparkles,
  Zap,
  Brain,
  Users,
  Shield,
  BarChart3,
  Globe,
  Target,
  Activity,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Star,
  Heart,
  Eye,
  TrendingUp,
  RotateCcw,
  Play,
  Pause,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  MousePointer,
  Keyboard,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Timer,
  Clock,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Camera,
  Video,
  Mic,
  MicOff,
  Download,
  Upload,
  Share,
  Bookmark,
  Flag,
  Archive,
  Trash2,
  Edit,
  Copy,
  Scissors,
  Clipboard,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Plus,
  Minus,
  Search,
  Filter,
  ArrowUpDown,
  Grid,
  List,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react"

interface AnimationConfig {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'flip' | 'bounce' | 'pulse' | 'wiggle' | 'float' | 'glow'
  duration: number
  delay: number
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic'
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out'
  intensity?: 'low' | 'medium' | 'high'
  loop?: boolean
  trigger?: 'hover' | 'click' | 'load' | 'scroll' | 'auto'
}

interface AdvancedAnimationProps {
  children: React.ReactNode
  config: AnimationConfig
  className?: string
  onAnimationStart?: () => void
  onAnimationEnd?: () => void
}

export function AdvancedAnimation({ 
  children, 
  config, 
  className = '', 
  onAnimationStart,
  onAnimationEnd 
}: AdvancedAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(config.trigger === 'auto')
  const elementRef = useRef<HTMLDivElement>(null)

  const getAnimationClass = useCallback(() => {
    const baseClass = 'transition-all duration-1000'
    const intensityClass = config.intensity === 'high' ? 'animate-bounce' : 
                          config.intensity === 'medium' ? 'animate-pulse' : 'animate-ping'
    
    const animationClasses = {
      fade: isVisible ? 'opacity-100' : 'opacity-0',
      slide: isVisible ? 
        (config.direction === 'up' ? 'translate-y-0' :
         config.direction === 'down' ? 'translate-y-0' :
         config.direction === 'left' ? 'translate-x-0' :
         config.direction === 'right' ? 'translate-x-0' : 'translate-x-0') :
        (config.direction === 'up' ? 'translate-y-8' :
         config.direction === 'down' ? '-translate-y-8' :
         config.direction === 'left' ? 'translate-x-8' :
         config.direction === 'right' ? '-translate-x-8' : 'translate-x-8'),
      scale: isVisible ? 'scale-100' : 'scale-95',
      rotate: isVisible ? 'rotate-0' : 'rotate-180',
      flip: isVisible ? 'rotate-y-0' : 'rotate-y-180',
      bounce: 'animate-bounce',
      pulse: 'animate-pulse',
      wiggle: 'animate-wiggle',
      float: 'animate-float',
      glow: isVisible ? 'shadow-2xl shadow-blue-500/50' : 'shadow-none'
    }

    return `${baseClass} ${animationClasses[config.type]} ${intensityClass}`
  }, [config, isVisible])

  useEffect(() => {
    if (config.trigger === 'auto') {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setIsAnimating(true)
        onAnimationStart?.()
        
        setTimeout(() => {
          setIsAnimating(false)
          onAnimationEnd?.()
        }, config.duration)
      }, config.delay)

      return () => clearTimeout(timer)
    }
  }, [config, onAnimationStart, onAnimationEnd])

  const handleMouseEnter = () => {
    if (config.trigger === 'hover') {
      setIsVisible(true)
      setIsAnimating(true)
      onAnimationStart?.()
    }
  }

  const handleMouseLeave = () => {
    if (config.trigger === 'hover') {
      setIsVisible(false)
      setIsAnimating(false)
      onAnimationEnd?.()
    }
  }

  const handleClick = () => {
    if (config.trigger === 'click') {
      setIsVisible(!isVisible)
      setIsAnimating(true)
      onAnimationStart?.()
      
      setTimeout(() => {
        setIsAnimating(false)
        onAnimationEnd?.()
      }, config.duration)
    }
  }

  return (
    <div
      ref={elementRef}
      className={`${getAnimationClass()} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        animationDuration: `${config.duration}ms`,
        animationDelay: `${config.delay}ms`,
        animationIterationCount: config.loop ? 'infinite' : 1,
        animationTimingFunction: config.easing
      }}
    >
      {children}
    </div>
  )
}

// Particle System Component
interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

interface ParticleSystemProps {
  particleCount?: number
  colors?: string[]
  intensity?: 'low' | 'medium' | 'high'
  shape?: 'circle' | 'star' | 'sparkle'
  className?: string
}

export function ParticleSystem({ 
  particleCount = 50, 
  colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981'],
  intensity = 'medium',
  shape = 'circle',
  className = ''
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | null>(null)

  const createParticle = useCallback((): Particle => {
    const canvas = canvasRef.current
    if (!canvas) return {} as Particle

    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * (intensity === 'high' ? 4 : intensity === 'medium' ? 2 : 1),
      vy: (Math.random() - 0.5) * (intensity === 'high' ? 4 : intensity === 'medium' ? 2 : 1),
      life: 0,
      maxLife: Math.random() * 200 + 100,
      size: Math.random() * (intensity === 'high' ? 6 : intensity === 'medium' ? 4 : 2) + 1,
      color: colors[Math.floor(Math.random() * colors.length)]
    }
  }, [colors, intensity])

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    particlesRef.current.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life++

      // Wrap around screen
      if (particle.x < 0) particle.x = canvas.width
      if (particle.x > canvas.width) particle.x = 0
      if (particle.y < 0) particle.y = canvas.height
      if (particle.y > canvas.height) particle.y = 0

      // Remove dead particles
      if (particle.life > particle.maxLife) {
        particlesRef.current.splice(index, 1)
        particlesRef.current.push(createParticle())
        return
      }

      // Draw particle
      const alpha = 1 - (particle.life / particle.maxLife)
      ctx.globalAlpha = alpha
      ctx.fillStyle = particle.color

      if (shape === 'circle') {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      } else if (shape === 'star') {
        drawStar(ctx, particle.x, particle.y, particle.size, particle.size * 0.5, 5)
      } else if (shape === 'sparkle') {
        drawSparkle(ctx, particle.x, particle.y, particle.size)
      }
    })

    animationRef.current = requestAnimationFrame(updateParticles)
  }, [createParticle, shape])

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, outerRadius: number, innerRadius: number, points: number) => {
    ctx.beginPath()
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI) / points
      const px = x + Math.cos(angle) * radius
      const py = y + Math.sin(angle) * radius
      
      if (i === 0) {
        ctx.moveTo(px, py)
      } else {
        ctx.lineTo(px, py)
      }
    }
    ctx.closePath()
    ctx.fill()
  }

  const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath()
    ctx.moveTo(x, y - size)
    ctx.lineTo(x, y + size)
    ctx.moveTo(x - size, y)
    ctx.lineTo(x + size, y)
    ctx.moveTo(x - size * 0.7, y - size * 0.7)
    ctx.lineTo(x + size * 0.7, y + size * 0.7)
    ctx.moveTo(x - size * 0.7, y + size * 0.7)
    ctx.lineTo(x + size * 0.7, y - size * 0.7)
    ctx.strokeStyle = ctx.fillStyle
    ctx.lineWidth = 2
    ctx.stroke()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, createParticle)

    // Start animation
    updateParticles()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particleCount, createParticle, updateParticles])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  )
}

// Morphing Background Component
interface MorphingBackgroundProps {
  colors?: string[]
  speed?: number
  complexity?: 'low' | 'medium' | 'high'
  className?: string
}

export function MorphingBackground({ 
  colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981'],
  speed = 1,
  complexity = 'medium',
  className = ''
}: MorphingBackgroundProps) {
  const [gradientPositions, setGradientPositions] = useState({
    x1: 0, y1: 0, x2: 100, y2: 100
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPositions({
        x1: Math.random() * 100,
        y1: Math.random() * 100,
        x2: Math.random() * 100,
        y2: Math.random() * 100
      })
    }, 1000 / speed)

    return () => clearInterval(interval)
  }, [speed])

  const getComplexityMultiplier = () => {
    switch (complexity) {
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 2
    }
  }

  return (
    <div 
      className={`absolute inset-0 ${className}`}
      style={{
        background: `
          radial-gradient(circle at ${gradientPositions.x1}% ${gradientPositions.y1}%, ${colors[0]}20 0%, transparent 50%),
          radial-gradient(circle at ${gradientPositions.x2}% ${gradientPositions.y2}%, ${colors[1]}20 0%, transparent 50%),
          linear-gradient(45deg, ${colors[2]}10, ${colors[3]}10)
        `,
        animation: `morph ${10000 / speed}ms ease-in-out infinite alternate`
      }}
    />
  )
}

// Interactive Hover Effects
interface HoverEffectProps {
  children: React.ReactNode
  effect: 'glow' | 'lift' | 'tilt' | 'scale' | 'rotate' | 'pulse'
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export function HoverEffect({ 
  children, 
  effect, 
  intensity = 'medium',
  className = ''
}: HoverEffectProps) {
  const getEffectClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-out'
    const intensityClasses = {
      low: 'hover:scale-105',
      medium: 'hover:scale-110',
      high: 'hover:scale-125'
    }

    const effectClasses = {
      glow: 'hover:shadow-2xl hover:shadow-blue-500/50',
      lift: 'hover:-translate-y-2 hover:shadow-xl',
      tilt: 'hover:rotate-1 hover:shadow-lg',
      scale: intensityClasses[intensity],
      rotate: 'hover:rotate-12',
      pulse: 'hover:animate-pulse'
    }

    return `${baseClasses} ${effectClasses[effect]} ${className}`
  }

  return (
    <div className={getEffectClasses()}>
      {children}
    </div>
  )
}

// Loading Animation Component
interface LoadingAnimationProps {
  type: 'spinner' | 'dots' | 'pulse' | 'wave' | 'bounce' | 'orbit'
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export function LoadingAnimation({ 
  type, 
  size = 'md', 
  color = '#3B82F6',
  className = ''
}: LoadingAnimationProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4'
      case 'md': return 'w-8 h-8'
      case 'lg': return 'w-12 h-12'
      default: return 'w-8 h-8'
    }
  }

  const renderSpinner = () => (
    <Loader2 className={`${getSizeClasses()} animate-spin ${className}`} style={{ color }} />
  )

  const renderDots = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${className}`}
          style={{
            backgroundColor: color,
            animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
          }}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <div 
      className={`${getSizeClasses()} rounded-full ${className}`}
      style={{
        backgroundColor: color,
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    />
  )

  const renderWave = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1 h-8 rounded-full"
          style={{
            backgroundColor: color,
            animation: `wave 1.2s ease-in-out ${i * 0.1}s infinite`
          }}
        />
      ))}
    </div>
  )

  const renderBounce = () => (
    <div className={`${getSizeClasses()} ${className}`}>
      <div 
        className="w-full h-full rounded-full"
        style={{
          backgroundColor: color,
          animation: 'bounce 1s infinite'
        }}
      />
    </div>
  )

  const renderOrbit = () => (
    <div className={`${getSizeClasses()} relative ${className}`}>
      <div 
        className="absolute inset-0 border-2 border-transparent border-t-current rounded-full animate-spin"
        style={{ color }}
      />
      <div 
        className="absolute inset-2 border-2 border-transparent border-r-current rounded-full animate-spin"
        style={{ 
          color, 
          animationDirection: 'reverse',
          animationDuration: '0.8s'
        }}
      />
    </div>
  )

  const renderAnimation = () => {
    switch (type) {
      case 'spinner': return renderSpinner()
      case 'dots': return renderDots()
      case 'pulse': return renderPulse()
      case 'wave': return renderWave()
      case 'bounce': return renderBounce()
      case 'orbit': return renderOrbit()
      default: return renderSpinner()
    }
  }

  return renderAnimation()
}

// CSS Animations (to be added to global CSS)
export const animationStyles = `
  @keyframes wiggle {
    0%, 7% { transform: rotateZ(0); }
    15% { transform: rotateZ(-15deg); }
    20% { transform: rotateZ(10deg); }
    25% { transform: rotateZ(-10deg); }
    30% { transform: rotateZ(6deg); }
    35% { transform: rotateZ(-4deg); }
    40%, 100% { transform: rotateZ(0); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @keyframes wave {
    0%, 60%, 100% { transform: scaleY(0.4); }
    30% { transform: scaleY(1); }
  }

  @keyframes morph {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(180deg); }
    100% { transform: scale(1) rotate(360deg); }
  }

  .animate-wiggle { animation: wiggle 1s ease-in-out; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-wave { animation: wave 1.2s ease-in-out infinite; }
  .animate-morph { animation: morph 10s ease-in-out infinite alternate; }
`
