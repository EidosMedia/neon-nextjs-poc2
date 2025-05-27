import { getAPIHostnameConfig } from '@/services/utils';
import { NextRequest } from 'next/server';
import { authenticationHeader } from '@/utilities/security';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { apiHostname } = await getAPIHostnameConfig(req);

  const id = (await params).id;
  const authHeaders = await authenticationHeader(true);

  const resp = await fetch(`${apiHostname}/api/v2/liveblogs/${id}/posts?${req.nextUrl.searchParams}`, {
    headers: {
      ...authHeaders,
    },
  });

  return resp;
}
