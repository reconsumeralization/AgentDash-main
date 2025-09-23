"use client"

import React from 'react'
import { GuidanceCodeGenerator } from '@/components/guidance-code-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { 
  Brain, 
  Shield, 
  Zap, 
  Eye, 
  TestTube, 
  FileText,
  Code2,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function GuidancePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold">Guidance Engine</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Enterprise-grade code generation with comprehensive security analysis, 
          quality metrics, and optimization. Generate superior code that exceeds 
          industry standards.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Security First
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Star className="h-3 w-3 mr-1" />
            Quality Assured
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Zap className="h-3 w-3 mr-1" />
            Performance Optimized
          </Badge>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Security Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Comprehensive security vulnerability detection with XSS, SQL injection, 
              CSRF protection, and data exposure analysis. Get detailed fixes and 
              recommendations for secure code.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Quality Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Advanced code quality analysis including maintainability index, 
              cyclomatic complexity, Halstead volume, and documentation coverage. 
              Objective quality measurement.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">Performance Optimization</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Built-in performance analysis with bottleneck detection, optimization 
              suggestions, and latency estimation. Generate efficient, scalable code.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Accessibility Compliance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              WCAG AA compliant code generation with ARIA labels, keyboard navigation, 
              and screen reader support. Inclusive by design.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Comprehensive Testing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Automated test generation with unit tests, integration tests, and 
              security test cases. Ensure code reliability and maintainability.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">Documentation Generation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Complete documentation with JSDoc comments, API documentation, 
              usage examples, and deployment guides. Self-documenting code.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Why Guidance Engine is Superior</CardTitle>
          <CardDescription className="text-center">
            Compare the quality and features of Guidance-generated code vs traditional approaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-600">Traditional Code Generation</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-sm">Basic syntax checking only</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-sm">No security analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-sm">Missing error handling</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-sm">No accessibility features</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-sm">Minimal documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span className="text-sm">No performance optimization</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600">Guidance Engine</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1"></CheckCircle>
                  <span className="text-sm">Comprehensive security analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1"></CheckCircle>
                  <span className="text-sm">Advanced quality metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1"></CheckCircle>
                  <span className="text-sm">Robust error handling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1"></CheckCircle>
                  <span className="text-sm">WCAG AA accessibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1"></CheckCircle>
                  <span className="text-sm">Complete documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1"></CheckCircle>
                  <span className="text-sm">Performance optimization</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Try Guidance Engine
          </CardTitle>
          <CardDescription>
            Generate enterprise-grade code with comprehensive analysis and optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuidanceCodeGenerator />
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Ready to Generate Superior Code?</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of developers who trust Guidance Engine for their 
              enterprise-grade code generation needs. Experience the difference 
              that comprehensive analysis makes.
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2">
                <ArrowRight className="h-4 w-4 mr-2" />
                Start Generating
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
