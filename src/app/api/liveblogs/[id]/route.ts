import { getAPIHostnameConfig } from '@/services/utils';
import { NextRequest } from 'next/server';
import { makeRequest } from '@/services/services';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { apiHostname } = await getAPIHostnameConfig(req);

  const id = (await params).id;

  return await makeRequest(apiHostname, `/api/v2/liveblogs/${id}/posts?${req.nextUrl.searchParams}`);
}
