/**
 * 🤖 AI PLATFORM - Main Page for Comprehensive AI-Powered Social Networking Platform
 * Simple chat-based interface with intelligent context switching and AI assistance
 */

'use client'

import React, { useState, useEffect } from 'react'
import AIChatInterfaceComponent from '@/components/ai-chat-interface'
import { ChatContext, ChatAction } from '@/lib'

export default function AIPlatformPage() {
  const [currentContext, setCurrentContext] = useState<ChatContext>({
    currentDomain: 'general',
    userPreferences: {
      communicationStyle: 'collaborative',
      notificationLevel: 'moderate',
      aiPersonality: 'helpful',
      preferredPlatforms: ['linkedin'],
      tribeFocus: [],
      projectTypes: []
    },
    sessionHistory: [],
    collaborationMode: 'solo'
  })
  const [executedActions, setExecutedActions] = useState<ChatAction[]>([])
  const [userId] = useState('user_123') // In real app, get from auth

  const handleContextSwitch = (newContext: ChatContext) => {
    console.log('🎨 Context switched to:', newContext.currentDomain)
    setCurrentContext(newContext)
    
    // Update page styling based on context
    updatePageStyling(newContext.currentDomain)
  }

  const handleActionExecuted = (action: ChatAction) => {
    console.log('⚡ Action executed:', action.type, action.target)
    setExecutedActions(prev => [...prev, action])
    
    // Show success notification
    showNotification(`Action completed: ${action.type} ${action.target}`, 'success')
  }

  const updatePageStyling = (domain: string) => {
    const root = document.documentElement
    
    const stylingMap: Record<string, Record<string, string>> = {
      'social-media': {
        '--primary-color': '#0077B5',
        '--secondary-color': '#005885',
        '--accent-color': '#00A0DC',
        '--background-color': '#F3F2EF',
        '--text-color': '#000000',
        '--border-color': '#E1E5E9'
      },
      'project-management': {
        '--primary-color': '#6B46C1',
        '--secondary-color': '#553C9A',
        '--accent-color': '#8B5CF6',
        '--background-color': '#FAFAFA',
        '--text-color': '#1F2937',
        '--border-color': '#E5E7EB'
      },
      'tribe-management': {
        '--primary-color': '#059669',
        '--secondary-color': '#047857',
        '--accent-color': '#10B981',
        '--background-color': '#F0FDF4',
        '--text-color': '#064E3B',
        '--border-color': '#D1FAE5'
      },
      'file-sharing': {
        '--primary-color': '#DC2626',
        '--secondary-color': '#B91C1C',
        '--accent-color': '#EF4444',
        '--background-color': '#FEF2F2',
        '--text-color': '#7F1D1D',
        '--border-color': '#FECACA'
      },
      'analytics': {
        '--primary-color': '#7C3AED',
        '--secondary-color': '#6D28D9',
        '--accent-color': '#A78BFA',
        '--background-color': '#FAFAFA',
        '--text-color': '#1F2937',
        '--border-color': '#E5E7EB'
      },
      'governance': {
        '--primary-color': '#1F2937',
        '--secondary-color': '#111827',
        '--accent-color': '#374151',
        '--background-color': '#F9FAFB',
        '--text-color': '#1F2937',
        '--border-color': '#D1D5DB'
      },
      'general': {
        '--primary-color': '#6366F1',
        '--secondary-color': '#4F46E5',
        '--accent-color': '#818CF8',
        '--background-color': '#F8FAFC',
        '--text-color': '#1E293B',
        '--border-color': '#E2E8F0'
      }
    }

    const styling = stylingMap[domain] || stylingMap['general']
    
    Object.entries(styling).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
  }

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    }`
    notification.textContent = message
    
    document.body.appendChild(notification)
    
    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)
  }

  useEffect(() => {
    // Initialize with general context styling
    updatePageStyling('general')
    
    // Set up keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            setCurrentContext(prev => ({ ...prev, currentDomain: 'social-media' }))
            break
          case '2':
            e.preventDefault()
            setCurrentContext(prev => ({ ...prev, currentDomain: 'project-management' }))
            break
          case '3':
            e.preventDefault()
            setCurrentContext(prev => ({ ...prev, currentDomain: 'tribe-management' }))
            break
          case '4':
            e.preventDefault()
            setCurrentContext(prev => ({ ...prev, currentDomain: 'file-sharing' }))
            break
          case '5':
            e.preventDefault()
            setCurrentContext(prev => ({ ...prev, currentDomain: 'analytics' }))
            break
          case '6':
            e.preventDefault()
            setCurrentContext(prev => ({ ...prev, currentDomain: 'governance' }))
            break
          case '0':
            e.preventDefault()
            setCurrentContext(prev => ({ ...prev, currentDomain: 'general' }))
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Platform Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Platform
                </h1>
              </div>
              <div className="ml-10">
                <nav className="flex space-x-8">
                  <span className="text-sm text-gray-500">
                    Social Networking • Tribe Management • Project Collaboration • AI Assistance
                  </span>
                </nav>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                User: {userId}
              </div>
              <div className="text-sm text-gray-500">
                Context: {currentContext.currentDomain}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="text-sm text-blue-700">
            <strong>Keyboard Shortcuts:</strong> Ctrl+1 (Social Media) • Ctrl+2 (Projects) • Ctrl+3 (Tribes) • Ctrl+4 (Files) • Ctrl+5 (Analytics) • Ctrl+6 (Governance) • Ctrl+0 (General)
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="h-[calc(100vh-120px)]">
        <AIChatInterfaceComponent
          userId={userId}
          initialContext={currentContext}
          onContextSwitch={handleContextSwitch}
          onActionExecuted={handleActionExecuted}
        />
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              AI-Powered Social Networking & Project Management Platform
            </div>
            <div className="text-sm text-gray-500">
              Actions Executed: {executedActions.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
