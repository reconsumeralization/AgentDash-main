"use client"

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import {
  Upload,
  Download,
  Users,
  Mail,
  Smartphone,
  Linkedin,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Shield
} from 'lucide-react'
import { useToast } from '@/components/providers'

interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  title?: string
  linkedinUrl?: string
  source: 'outlook' | 'gmail' | 'yahoo' | 'linkedin' | 'mobile' | 'manual'
  tags: string[]
  notes?: string
  importedAt: Date
}

interface ImportResult {
  totalContacts: number
  importedContacts: number
  duplicateContacts: number
  failedContacts: number
  errors: string[]
}

interface ImportJob {
  id: string
  source: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  totalContacts: number
  importedContacts: number
  startedAt: Date
  completedAt?: Date
  result?: ImportResult
}

export function ContactImporter() {
  const [activeTab, setActiveTab] = useState('outlook')
  const [importJobs, setImportJobs] = useState<ImportJob[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  // Outlook CSV Import
  const handleOutlookImport = useCallback(async () => {
    if (!selectedFile) {
      toast.error('No File Selected', 'Please select an Outlook CSV file')
      return
    }

    const jobId = `import-${Date.now()}`
    const job: ImportJob = {
      id: jobId,
      source: 'Outlook CSV',
      status: 'processing',
      progress: 0,
      totalContacts: 0,
      importedContacts: 0,
      startedAt: new Date()
    }

    setImportJobs(prev => [...prev, job])

    try {
      // Simulate CSV parsing and import
      const text = await selectedFile.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',')

      const totalContacts = lines.length - 1
      job.totalContacts = totalContacts

      // Simulate processing contacts
      for (let i = 1; i <= totalContacts; i++) {
        const progress = (i / totalContacts) * 100
        setImportJobs(prev => prev.map(j =>
          j.id === jobId ? { ...j, progress, importedContacts: i } : j
        ))

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 50))

        // Mock contact creation
        const contact: Contact = {
          id: `contact-${Date.now()}-${i}`,
          name: `Contact ${i}`,
          email: `contact${i}@example.com`,
          company: 'Example Company',
          title: 'Professional',
          source: 'outlook',
          tags: ['imported', 'outlook'],
          importedAt: new Date()
        }

        setContacts(prev => [...prev, contact])
      }

      const result: ImportResult = {
        totalContacts,
        importedContacts: totalContacts,
        duplicateContacts: 0,
        failedContacts: 0,
        errors: []
      }

      setImportJobs(prev => prev.map(j =>
        j.id === jobId ? {
          ...j,
          status: 'completed',
          completedAt: new Date(),
          result
        } : j
      ))

      toast.success('Import Complete', `Successfully imported ${totalContacts} contacts from Outlook`)

    } catch (error) {
      setImportJobs(prev => prev.map(j =>
        j.id === jobId ? {
          ...j,
          status: 'failed',
          completedAt: new Date()
        } : j
      ))
      toast.error('Import Failed', 'Failed to import Outlook contacts')
    }

    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [selectedFile, toast])

  // Gmail Import (OAuth flow simulation)
  const handleGmailImport = useCallback(async () => {
    const jobId = `import-${Date.now()}`
    const job: ImportJob = {
      id: jobId,
      source: 'Gmail',
      status: 'processing',
      progress: 0,
      totalContacts: 0,
      importedContacts: 0,
      startedAt: new Date()
    }

    setImportJobs(prev => [...prev, job])

    try {
      // Simulate OAuth flow and contact fetching
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock Gmail contacts
      const gmailContacts = Array.from({ length: 150 }, (_, i) => ({
        id: `gmail-${Date.now()}-${i}`,
        name: `Gmail Contact ${i + 1}`,
        email: `gmail${i + 1}@example.com`,
        source: 'gmail' as const,
        tags: ['imported', 'gmail'],
        importedAt: new Date()
      }))

      for (let i = 0; i < gmailContacts.length; i++) {
        const progress = ((i + 1) / gmailContacts.length) * 100
        setImportJobs(prev => prev.map(j =>
          j.id === jobId ? { ...j, progress, importedContacts: i + 1 } : j
        ))

        setContacts(prev => [...prev, gmailContacts[i]])
        await new Promise(resolve => setTimeout(resolve, 30))
      }

      const result: ImportResult = {
        totalContacts: gmailContacts.length,
        importedContacts: gmailContacts.length,
        duplicateContacts: 0,
        failedContacts: 0,
        errors: []
      }

      setImportJobs(prev => prev.map(j =>
        j.id === jobId ? {
          ...j,
          status: 'completed',
          completedAt: new Date(),
          result
        } : j
      ))

      toast.success('Gmail Import Complete', `Successfully imported ${gmailContacts.length} contacts from Gmail`)

    } catch (error) {
      setImportJobs(prev => prev.map(j =>
        j.id === jobId ? {
          ...j,
          status: 'failed',
          completedAt: new Date()
        } : j
      ))
      toast.error('Gmail Import Failed', 'Failed to import Gmail contacts')
    }
  }, [toast])

  // LinkedIn Import
  const handleLinkedInImport = useCallback(async () => {
    const jobId = `import-${Date.now()}`
    const job: ImportJob = {
      id: jobId,
      source: 'LinkedIn',
      status: 'processing',
      progress: 0,
      totalContacts: 0,
      importedContacts: 0,
      startedAt: new Date()
    }

    setImportJobs(prev => [...prev, job])

    try {
      // Simulate LinkedIn OAuth and contact extraction
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock LinkedIn connections
      const linkedinContacts = Array.from({ length: 500 }, (_, i) => ({
        id: `linkedin-${Date.now()}-${i}`,
        name: `LinkedIn Connection ${i + 1}`,
        email: `linkedin${i + 1}@professional.com`,
        company: 'Tech Company',
        title: 'Senior Professional',
        linkedinUrl: `https://linkedin.com/in/connection${i + 1}`,
        source: 'linkedin' as const,
        tags: ['imported', 'linkedin', 'professional'],
        importedAt: new Date()
      }))

      for (let i = 0; i < linkedinContacts.length; i++) {
        const progress = ((i + 1) / linkedinContacts.length) * 100
        setImportJobs(prev => prev.map(j =>
          j.id === jobId ? { ...j, progress, importedContacts: i + 1 } : j
        ))

        setContacts(prev => [...prev, linkedinContacts[i]])
        await new Promise(resolve => setTimeout(resolve, 20))
      }

      const result: ImportResult = {
        totalContacts: linkedinContacts.length,
        importedContacts: linkedinContacts.length,
        duplicateContacts: 0,
        failedContacts: 0,
        errors: []
      }

      setImportJobs(prev => prev.map(j =>
        j.id === jobId ? {
          ...j,
          status: 'completed',
          completedAt: new Date(),
          result
        } : j
      ))

      toast.success('LinkedIn Import Complete', `Successfully imported ${linkedinContacts.length} connections from LinkedIn`)

    } catch (error) {
      setImportJobs(prev => prev.map(j =>
        j.id === jobId ? {
          ...j,
          status: 'failed',
          completedAt: new Date()
        } : j
      ))
      toast.error('LinkedIn Import Failed', 'Failed to import LinkedIn connections')
    }
  }, [toast])

  // Mobile Device Import
  const handleMobileImport = useCallback(async () => {
    const jobId = `import-${Date.now()}`
    const job: ImportJob = {
      id: jobId,
      source: 'Mobile Device',
      status: 'processing',
      progress: 0,
      totalContacts: 0,
      importedContacts: 0,
      startedAt: new Date()
    }

    setImportJobs(prev => [...prev, job])

    try {
      // Simulate mobile device contact access
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock mobile contacts
      const mobileContacts = Array.from({ length: 200 }, (_, i) => ({
        id: `mobile-${Date.now()}-${i}`,
        name: `Mobile Contact ${i + 1}`,
        phone: `+1-555-${String(i + 100).padStart(3, '0')}-${String(i + 1000).padStart(4, '0')}`,
        email: `mobile${i + 1}@phone.com`,
        source: 'mobile' as const,
        tags: ['imported', 'mobile', 'personal'],
        importedAt: new Date()
      }))

      for (let i = 0; i < mobileContacts.length; i++) {
        const progress = ((i + 1) / mobileContacts.length) * 100
        setImportJobs(prev => prev.map(j =>
          j.id === jobId ? { ...j, progress, importedContacts: i + 1 } : j
        ))

        setContacts(prev => [...prev, mobileContacts[i]])
        await new Promise(resolve => setTimeout(resolve, 25))
      }

      const result: ImportResult = {
        totalContacts: mobileContacts.length,
        importedContacts: mobileContacts.length,
        duplicateContacts: 0,
        failedContacts: 0,
        errors: []
      }

      setImportJobs(prev => prev.map(j =>
        j.id === jobId ? {
          ...j,
          status: 'completed',
          completedAt: new Date(),
          result
        } : j
      ))

      toast.success('Mobile Import Complete', `Successfully imported ${mobileContacts.length} contacts from mobile device`)

    } catch (error) {
      setImportJobs(prev => prev.map(j =>
        j.id === jobId ? {
          ...j,
          status: 'failed',
          completedAt: new Date()
        } : j
      ))
      toast.error('Mobile Import Failed', 'Failed to import mobile contacts')
    }
  }, [toast])

  // CSV File Upload Handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Invalid File Type', 'Please select a CSV file')
        return
      }
      setSelectedFile(file)
      toast.success('File Selected', `${file.name} selected for import`)
    }
  }, [toast])

  // Export Contacts
  const exportContacts = useCallback(async (format: 'csv' | 'json' | 'vcard') => {
    try {
      let content: string
      let filename: string
      let mimeType: string

      switch (format) {
        case 'csv':
          content = 'Name,Email,Phone,Company,Title,LinkedIn,Source,Tags\n' +
            contacts.map(contact =>
              `"${contact.name}","${contact.email || ''}","${contact.phone || ''}","${contact.company || ''}","${contact.title || ''}","${contact.linkedinUrl || ''}","${contact.source}","${contact.tags.join(';')}"`
            ).join('\n')
          filename = 'defconect-contacts.csv'
          mimeType = 'text/csv'
          break

        case 'json':
          content = JSON.stringify(contacts, null, 2)
          filename = 'defconect-contacts.json'
          mimeType = 'application/json'
          break

        case 'vcard':
          content = contacts.map(contact => {
            let vcard = 'BEGIN:VCARD\nVERSION:3.0\n'
            vcard += `FN:${contact.name}\n`
            if (contact.email) vcard += `EMAIL:${contact.email}\n`
            if (contact.phone) vcard += `TEL:${contact.phone}\n`
            if (contact.company) vcard += `ORG:${contact.company}\n`
            if (contact.title) vcard += `TITLE:${contact.title}\n`
            vcard += 'END:VCARD\n'
            return vcard
          }).join('')
          filename = 'defconect-contacts.vcf'
          mimeType = 'text/vcard'
          break

        default:
          throw new Error('Unsupported export format')
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Export Complete', `Contacts exported as ${format.toUpperCase()}`)

    } catch (error) {
      toast.error('Export Failed', 'Failed to export contacts')
    }
  }, [contacts, toast])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Contact Importer
          </h1>
          <p className="text-gray-600 mt-1">
            Import contacts from multiple sources to bootstrap your DefConect network
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {contacts.length} Total Contacts
          </Badge>
          <Select onValueChange={exportContacts}>
            <SelectTrigger className="w-32">
              <Download className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">Export CSV</SelectItem>
              <SelectItem value="json">Export JSON</SelectItem>
              <SelectItem value="vcard">Export vCard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Import Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Imported</p>
                <p className="text-xl font-bold">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm font-medium">Email Contacts</p>
                <p className="text-xl font-bold">{contacts.filter(c => c.email).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Linkedin className="w-6 h-6 text-blue-700" />
              <div>
                <p className="text-sm font-medium">LinkedIn</p>
                <p className="text-xl font-bold">{contacts.filter(c => c.source === 'linkedin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Mobile</p>
                <p className="text-xl font-bold">{contacts.filter(c => c.source === 'mobile').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="outlook">Outlook</TabsTrigger>
          <TabsTrigger value="gmail">Gmail</TabsTrigger>
          <TabsTrigger value="yahoo">Yahoo</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>

        <TabsContent value="outlook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Outlook Import
              </CardTitle>
              <CardDescription>
                Import contacts from Microsoft Outlook CSV export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Steps to export from Outlook:</strong><br />
                  1. Open Outlook → File → Open & Export → Import/Export<br />
                  2. Select "Export to a file" → Comma Separated Values<br />
                  3. Select your Contacts folder → Choose save location
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="outlook-file">Select Outlook CSV File</Label>
                <Input
                  id="outlook-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="mt-1"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <Button
                onClick={handleOutlookImport}
                disabled={!selectedFile}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import from Outlook CSV
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gmail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-600" />
                Gmail Import
              </CardTitle>
              <CardDescription>
                Import contacts from Google Gmail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Privacy Note:</strong> This will initiate OAuth authentication with Google.
                  Only contact information will be imported - no emails or personal data.
                </AlertDescription>
              </Alert>

              <div className="text-center py-8">
                <Mail className="w-16 h-16 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-medium mb-2">Connect to Gmail</h3>
                <p className="text-gray-500 mb-4">
                  Import your Gmail contacts directly into DefConect
                </p>
                <Button onClick={handleGmailImport} size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Import from Gmail
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yahoo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                Yahoo Mail Import
              </CardTitle>
              <CardDescription>
                Import contacts from Yahoo Mail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Export Steps:</strong><br />
                  1. Open Yahoo Mail → Contacts<br />
                  2. Click Actions → Export<br />
                  3. Download the yahoo_contacts.csv file
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="yahoo-file">Select Yahoo CSV File</Label>
                <Input
                  id="yahoo-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>

              <Button className="w-full" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Yahoo Import (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-blue-700" />
                LinkedIn Import
              </CardTitle>
              <CardDescription>
                Import your LinkedIn connections and network data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>LinkedIn Export Steps:</strong><br />
                  1. Go to LinkedIn → My Network → Connections<br />
                  2. Click "Manage synced and imported contacts"<br />
                  3. Under Advanced Options → Export contacts<br />
                  4. Request archive and download Connections.csv
                </AlertDescription>
              </Alert>

              <div className="text-center py-8">
                <Linkedin className="w-16 h-16 mx-auto mb-4 text-blue-700" />
                <h3 className="text-lg font-medium mb-2">Connect to LinkedIn</h3>
                <p className="text-gray-500 mb-4">
                  Import your professional network into DefConect
                </p>
                <Button onClick={handleLinkedInImport} size="lg">
                  <Linkedin className="w-4 h-4 mr-2" />
                  Import LinkedIn Connections
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                Mobile Device Import
              </CardTitle>
              <CardDescription>
                Import contacts from your mobile phone or tablet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Mobile Access:</strong> This will request access to your device's contact list.
                  Only contact information will be imported for professional networking purposes.
                </AlertDescription>
              </Alert>

              <div className="text-center py-8">
                <Smartphone className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium mb-2">Mobile Contacts</h3>
                <p className="text-gray-500 mb-4">
                  Import contacts from your phone's address book
                </p>
                <Button onClick={handleMobileImport} size="lg">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Import Mobile Contacts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Jobs Status */}
      {importJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Jobs</CardTitle>
            <CardDescription>
              Track the status of your contact import operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {importJobs.slice(-5).map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {job.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {job.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-600" />}
                      {job.status === 'processing' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                      <div>
                        <p className="font-medium">{job.source}</p>
                        <p className="text-sm text-gray-500">
                          {job.importedContacts} of {job.totalContacts} contacts
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {job.status}
                    </Badge>
                  </div>

                  {job.status === 'processing' && (
                    <Progress value={job.progress} className="mb-2" />
                  )}

                  {job.result && (
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-1 font-medium">{job.result.totalContacts}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Imported:</span>
                        <span className="ml-1 font-medium text-green-600">{job.result.importedContacts}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duplicates:</span>
                        <span className="ml-1 font-medium text-yellow-600">{job.result.duplicateContacts}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Failed:</span>
                        <span className="ml-1 font-medium text-red-600">{job.result.failedContacts}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Contacts Preview */}
      {contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Imports</CardTitle>
            <CardDescription>
              Preview of your most recently imported contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contacts.slice(-10).reverse().map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-500">
                        {contact.email || contact.phone || 'No contact info'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {contact.source}
                    </Badge>
                    {contact.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
