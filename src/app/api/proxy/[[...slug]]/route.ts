import { NextRequest } from 'next/server';
import { getAPIHostnameConfig } from '@/services/utils';
import { authenticationHeader } from '@/utilities/security';
import { makeRequest } from '@/services/services';

export async function GET(req: NextRequest) {
  const { apiHostname } = await getAPIHostnameConfig(req);

  return await makeRequest(apiHostname, `${req.nextUrl.pathname}?${req.nextUrl.searchParams}`);
}
