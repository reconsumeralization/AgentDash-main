import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // TODO: Implement logic to fetch conversation data with milestones
  const timeline = [
    { type: 'message', speaker: 'User', text: 'Hello, world!', timestamp: '2025-09-18T10:00:00Z' },
    { type: 'milestone', title: 'Project Kick-off', summary: 'The project was officially started.', transcript_snippet: '...', timestamp: '2025-09-18T10:05:00Z' },
  ];
  return NextResponse.json({ timeline });
}
