/**
 * Intelligent News Page
 * Displays the synthesized news feed and leading indicators
 */

import { IntelligentNewsDashboard } from '@/components/intelligent-news-dashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Intelligent News Synthesis | AgentDash',
  description: 'Leading intelligent indicators from synthesized user content across all platforms',
}

export default function IntelligentNewsPage() {
  return (
    <div className="container mx-auto py-6">
      <IntelligentNewsDashboard 
        autoRefresh={true}
        refreshInterval={300000} // 5 minutes
      />
    </div>
  )
}
