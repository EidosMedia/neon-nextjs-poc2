import { NextRequest } from 'next/server';
import { getAPIHostnameConfig } from '@/services/utils';
import { authenticationHeader } from '@/utilities/security';

export async function GET(req: NextRequest) {
  const { apiHostname } = await getAPIHostnameConfig(req);

  const authHeaders = await authenticationHeader(true);

  const resp = await fetch(`${apiHostname}${req.nextUrl.pathname}?${req.nextUrl.searchParams}`, {
    headers: {
      ...authHeaders,
    },
  });

  return resp;
}
