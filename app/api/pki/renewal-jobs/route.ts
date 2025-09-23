// PKI Renewal Jobs API Route
// Manage automatic certificate renewal jobs

import { NextRequest, NextResponse } from 'next/server';
import { RenewalJob } from '@/lib/pki/types';

// Mock storage for renewal jobs (in production, use a database)
let renewalJobs: RenewalJob[] = [
  {
    id: 'renewal-example-com-1',
    domain: 'example.com',
    status: 'pending',
    scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    attempts: 0,
    maxAttempts: 3,
  },
];

// GET /api/pki/renewal-jobs - List all renewal jobs
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(renewalJobs);
  } catch (error) {
    console.error('Failed to fetch renewal jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch renewal jobs' },
      { status: 500 }
    );
  }
}

// POST /api/pki/renewal-jobs - Create a new renewal job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, scheduleDays = 30, maxAttempts = 3 } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainPattern.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Check if renewal job already exists for this domain
    const existingJob = renewalJobs.find(job => job.domain === domain);
    if (existingJob) {
      return NextResponse.json(
        { error: `Renewal job already exists for domain: ${domain}` },
        { status: 409 }
      );
    }

    // Validate schedule days
    if (scheduleDays < 1 || scheduleDays > 365) {
      return NextResponse.json(
        { error: 'Schedule days must be between 1 and 365' },
        { status: 400 }
      );
    }

    // Validate max attempts
    if (maxAttempts < 1 || maxAttempts > 10) {
      return NextResponse.json(
        { error: 'Max attempts must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Create new renewal job
    const now = new Date();
    const scheduledFor = new Date(now.getTime() + scheduleDays * 24 * 60 * 60 * 1000);

    const newJob: RenewalJob = {
      id: `renewal-${domain}-${Date.now()}`,
      domain,
      status: 'pending',
      scheduledFor,
      attempts: 0,
      maxAttempts,
    };

    renewalJobs.push(newJob);

    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error('Failed to create renewal job:', error);
    return NextResponse.json(
      { error: 'Failed to create renewal job' },
      { status: 500 }
    );
  }
}

// DELETE /api/pki/renewal-jobs/[jobId] - Delete a renewal job
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Find and remove the renewal job
    const jobIndex = renewalJobs.findIndex(job => job.id === jobId);
    if (jobIndex === -1) {
      return NextResponse.json(
        { error: 'Renewal job not found' },
        { status: 404 }
      );
    }

    const deletedJob = renewalJobs.splice(jobIndex, 1)[0];

    return NextResponse.json(
      { message: `Renewal job ${jobId} deleted successfully`, job: deletedJob },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete renewal job:', error);
    return NextResponse.json(
      { error: 'Failed to delete renewal job' },
      { status: 500 }
    );
  }
}
