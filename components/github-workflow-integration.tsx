"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Progress } from '@/components/ui';
import {
  Github,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Play,
  Square,
  Settings,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Code,
  Workflow,
  Zap,
  Shield,
  Activity,
  ExternalLink
} from 'lucide-react';

interface GitHubRepository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  issues: number;
  lastCommit: string;
  branch: string;
  status: 'active' | 'archived' | 'private';
}

interface GitHubWorkflow {
  id: string;
  name: string;
  path: string;
  state: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  runs: WorkflowRun[];
}

interface WorkflowRun {
  id: string;
  name: string;
  headBranch: string;
  headSha: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failure' | 'cancelled';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
  createdAt: string;
  updatedAt: string;
  duration: number;
  url: string;
}

interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: string;
  status: 'open' | 'closed' | 'merged';
  createdAt: string;
  updatedAt: string;
  branch: string;
  baseBranch: string;
  commits: number;
  additions: number;
  deletions: number;
  reviewers: string[];
}

export function GitHubWorkflowIntegration() {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [workflows, setWorkflows] = useState<GitHubWorkflow[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [activeTab, setActiveTab] = useState('repositories');
  const [isLoading, setIsLoading] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Sample data for demonstration
  useEffect(() => {
    setRepositories([
      {
        id: '1',
        name: 'agentdash-core',
        fullName: 'agentdash/agentdash-core',
        description: 'Core AgentDash platform with AI orchestration',
        language: 'TypeScript',
        stars: 245,
        forks: 67,
        issues: 12,
        lastCommit: '2024-01-16T14:30:00Z',
        branch: 'main',
        status: 'active'
      },
      {
        id: '2',
        name: 'agentdash-api',
        fullName: 'agentdash/agentdash-api',
        description: 'REST API for AgentDash platform',
        language: 'Python',
        stars: 189,
        forks: 34,
        issues: 8,
        lastCommit: '2024-01-16T12:15:00Z',
        branch: 'develop',
        status: 'active'
      },
      {
        id: '3',
        name: 'agentdash-mobile',
        fullName: 'agentdash/agentdash-mobile',
        description: 'React Native mobile app',
        language: 'JavaScript',
        stars: 156,
        forks: 28,
        issues: 15,
        lastCommit: '2024-01-15T16:45:00Z',
        branch: 'main',
        status: 'private'
      }
    ]);

    setPullRequests([
      {
        id: '1',
        number: 42,
        title: 'Add AI agent builder integration',
        author: 'alice-dev',
        status: 'open',
        createdAt: '2024-01-14T10:00:00Z',
        updatedAt: '2024-01-16T09:30:00Z',
        branch: 'feature/ai-agent-builder',
        baseBranch: 'main',
        commits: 8,
        additions: 1247,
        deletions: 89,
        reviewers: ['bob-reviewer', 'charlie-arch']
      },
      {
        id: '2',
        number: 41,
        title: 'Fix workflow performance issues',
        author: 'diana-qa',
        status: 'merged',
        createdAt: '2024-01-12T14:20:00Z',
        updatedAt: '2024-01-15T11:45:00Z',
        branch: 'fix/workflow-performance',
        baseBranch: 'main',
        commits: 5,
        additions: 234,
        deletions: 67,
        reviewers: ['eve-lead', 'frank-senior']
      }
    ]);

    setWorkflows([
      {
        id: '1',
        name: 'CI Pipeline',
        path: '.github/workflows/ci.yml',
        state: 'active',
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-16T14:30:00Z',
        runs: [
          {
            id: 'run-1',
            name: 'CI Pipeline',
            headBranch: 'main',
            headSha: 'abc123',
            status: 'completed',
            conclusion: 'success',
            createdAt: '2024-01-16T14:00:00Z',
            updatedAt: '2024-01-16T14:30:00Z',
            duration: 1800,
            url: 'https://github.com/agentdash/agentdash-core/actions/runs/123'
          },
          {
            id: 'run-2',
            name: 'CI Pipeline',
            headBranch: 'feature/ai-agent-builder',
            headSha: 'def456',
            status: 'in_progress',
            conclusion: null,
            createdAt: '2024-01-16T13:45:00Z',
            updatedAt: '2024-01-16T14:15:00Z',
            duration: 900,
            url: 'https://github.com/agentdash/agentdash-core/actions/runs/124'
          }
        ]
      },
      {
        id: '2',
        name: 'Security Scan',
        path: '.github/workflows/security.yml',
        state: 'active',
        createdAt: '2024-01-08T10:00:00Z',
        updatedAt: '2024-01-16T12:00:00Z',
        runs: [
          {
            id: 'sec-1',
            name: 'Security Scan',
            headBranch: 'main',
            headSha: 'ghi789',
            status: 'completed',
            conclusion: 'success',
            createdAt: '2024-01-16T11:30:00Z',
            updatedAt: '2024-01-16T12:00:00Z',
            duration: 1800,
            url: 'https://github.com/agentdash/agentdash-core/actions/runs/125'
          }
        ]
      }
    ]);
  }, []);

  const handleConnectGitHub = () => {
    if (githubToken) {
      // Simulate connection
      setShowTokenInput(false);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  const handleRunWorkflow = (workflow: GitHubWorkflow) => {
    // Simulate workflow trigger
    const newRun: WorkflowRun = {
      id: `run-${Date.now()}`,
      name: workflow.name,
      headBranch: selectedRepo?.branch || 'main',
      headSha: 'new-commit-sha',
      status: 'queued',
      conclusion: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duration: 0,
      url: `https://github.com/${selectedRepo?.fullName}/actions/runs/${Date.now()}`
    };

    setWorkflows(prev => prev.map(w =>
      w.id === workflow.id
        ? { ...w, runs: [newRun, ...w.runs] }
        : w
    ));

    // Simulate workflow progression
    setTimeout(() => {
      setWorkflows(prev => prev.map(w =>
        w.id === workflow.id
          ? {
              ...w,
              runs: w.runs.map(r =>
                r.id === newRun.id
                  ? { ...r, status: 'in_progress' as const, updatedAt: new Date().toISOString() }
                  : r
              )
            }
          : w
      ));
    }, 2000);

    setTimeout(() => {
      setWorkflows(prev => prev.map(w =>
        w.id === workflow.id
          ? {
              ...w,
              runs: w.runs.map(r =>
                r.id === newRun.id
                  ? {
                      ...r,
                      status: 'completed' as const,
                      conclusion: 'success' as const,
                      updatedAt: new Date().toISOString(),
                      duration: Math.floor(Math.random() * 1800) + 600
                    }
                  : r
              )
            }
          : w
      ));
    }, 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'queued':
        return 'bg-yellow-500';
      case 'failure':
      case 'error':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPRStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'merged': return 'bg-purple-500';
      case 'closed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Github className="h-8 w-8 text-gray-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GitHub Workflow Integration</h1>
              <p className="text-gray-600 mt-1">Connect your AgentDash workflows with GitHub repositories and CI/CD pipelines</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowTokenInput(!showTokenInput)}
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button className="bg-gray-800 hover:bg-gray-900 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Repository
            </Button>
          </div>
        </div>

        {/* GitHub Token Input */}
        {showTokenInput && (
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                <Input
                  id="github-token"
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleConnectGitHub}
                disabled={!githubToken || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Connect
              </Button>
            </div>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="pull-requests">Pull Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="repositories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <Card
                key={repo.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedRepo?.id === repo.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRepo(repo)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Github className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{repo.name}</CardTitle>
                        <p className="text-sm text-gray-600">{repo.fullName}</p>
                      </div>
                    </div>
                    <Badge variant={repo.status === 'private' ? 'secondary' : 'default'}>
                      {repo.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{repo.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Code className="h-4 w-4 mr-1 text-blue-500" />
                      {repo.language}
                    </span>
                    <span className="flex items-center">
                      <GitBranch className="h-4 w-4 mr-1 text-green-500" />
                      {repo.branch}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-yellow-600">⭐ {repo.stars}</div>
                      <div className="text-xs text-gray-500">Stars</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-600">🍴 {repo.forks}</div>
                      <div className="text-xs text-gray-500">Forks</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">⚠️ {repo.issues}</div>
                      <div className="text-xs text-gray-500">Issues</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Updated {new Date(repo.lastCommit).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          {selectedRepo ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Workflows for {selectedRepo.name}</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Workflow
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {workflows.map((workflow) => (
                  <Card key={workflow.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Workflow className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{workflow.name}</CardTitle>
                            <p className="text-sm text-gray-600">{workflow.path}</p>
                          </div>
                        </div>
                        <Badge variant={workflow.state === 'active' ? 'default' : 'secondary'}>
                          {workflow.state}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Button
                          onClick={() => handleRunWorkflow(workflow)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run Workflow
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on GitHub
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Recent Runs</h4>
                        {workflow.runs.slice(0, 3).map((run) => (
                          <div key={run.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(run.status)}`} />
                              <div>
                                <div className="text-sm font-medium">{run.name}</div>
                                <div className="text-xs text-gray-600">
                                  {run.headBranch} • {run.headSha.slice(0, 7)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                {run.status === 'completed' && run.duration ? formatDuration(run.duration) : run.status}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(run.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Github className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Select a Repository</h3>
              <p className="text-gray-600">Choose a repository to view its workflows</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pull-requests" className="space-y-6">
          <div className="space-y-4">
            {pullRequests.map((pr) => (
              <Card key={pr.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getPRStatusColor(pr.status)}`} />
                        <h3 className="text-lg font-semibold">#{pr.number} {pr.title}</h3>
                        <Badge variant={pr.status === 'open' ? 'default' : 'secondary'}>
                          {pr.status}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>By {pr.author}</span>
                        <span>•</span>
                        <span>{pr.branch} → {pr.baseBranch}</span>
                        <span>•</span>
                        <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <GitCommit className="h-4 w-4 text-blue-500" />
                          <span>{pr.commits} commits</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-green-600">+{pr.additions}</span>
                          <span className="text-red-600">-{pr.deletions}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{pr.reviewers.length} reviewers</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {pr.status === 'open' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <GitMerge className="h-3 w-3 mr-1" />
                          Merge
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Repositories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{repositories.length}</div>
                <p className="text-sm text-gray-600 mt-1">Connected repos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {workflows.filter(w => w.state === 'active').length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Running workflows</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Open PRs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {pullRequests.filter(pr => pr.status === 'open').length}
                </div>
                <p className="text-sm text-gray-600 mt-1">Pull requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">94.2%</div>
                <p className="text-sm text-gray-600 mt-1">Workflow success</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CI Pipeline Success Rate</span>
                  <span>96%</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Security Scan Coverage</span>
                  <span>89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Test Coverage</span>
                  <span>84%</span>
                </div>
                <Progress value={84} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
