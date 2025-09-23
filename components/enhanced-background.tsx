"use client"

import { useEffect, useState } from "react"

export function EnhancedBackground() {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      speed: number
      opacity: number
    }>
  >([])

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      }))
      setParticles(newParticles)
    }

    generateParticles()
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Neural network background */}
      <div className="absolute inset-0 bg-neural-gradient" />

      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-primary/30 rounded-full animate-particle-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: `${particle.id * 0.5}s`,
            animationDuration: `${particle.speed + 4}s`,
          }}
        />
      ))}

      {/* Floating geometric shapes */}
      <div
        className="absolute top-1/4 left-1/4 w-8 h-8 border border-primary/20 rotate-45 animate-quantum-spin"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-3/4 right-1/3 w-6 h-6 bg-primary/10 rounded-full animate-neural-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-accent/20 animate-morphing-blob"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-3 h-12 bg-gradient-to-b from-primary/20 to-transparent animate-data-flow"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-10 h-2 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-data-flow"
        style={{ animationDelay: "3s" }}
      />

      {/* Matrix-style code rain effect */}
      <div
        className="absolute top-0 left-1/6 w-px h-full bg-gradient-to-b from-transparent via-green-500/20 to-transparent animate-code-stream"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-0 left-2/6 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-code-stream"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute top-0 left-4/6 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-code-stream"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute top-0 left-5/6 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-code-stream"
        style={{ animationDelay: "4.5s" }}
      />
    </div>
  )
}
