import { NextRequest, NextResponse } from 'next/server';
import { getAPIHostnameConfig } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';

export async function GET(req: NextRequest) {
  const { apiHostname } = await getAPIHostnameConfig(req);
  const auth = await getAuthOptions();

  const isVersionsRequest = /\/versions(?:\/live)?\/?$/i.test(req.nextUrl.pathname);
  if (isVersionsRequest && !auth.editorialAuth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return await connection.makeApiRequest(`${req.nextUrl.pathname}?${req.nextUrl.searchParams}`, auth, {}, apiHostname);
}
