import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // TODO: Implement logic to fetch speaker data and their interactions
  const speakerMap = {
    nodes: [
      { id: 'user1', name: 'User 1', influence: 0.6 },
      { id: 'user2', name: 'User 2', influence: 0.4 },
    ],
    links: [
      { source: 'user1', target: 'user2', weight: 0.8 },
    ],
  };
  return NextResponse.json({ speakerMap });
}
