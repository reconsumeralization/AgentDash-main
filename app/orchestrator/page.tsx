/**
 * Architecture Orchestrator Page
 * Route for the parallel architecture execution dashboard
 */

import { ArchitectureOrchestratorDashboard } from '@/components/architecture-orchestrator-dashboard'

export default function OrchestratorPage() {
  return <ArchitectureOrchestratorDashboard />
}

export const metadata = {
  title: 'Architecture Orchestrator | DefConect',
  description: 'Parallel execution dashboard for DefConect architecture components'
}
