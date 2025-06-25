import { NextRequest } from 'next/server';
import { getAPIHostnameConfig } from '@/services/utils';
import { makeApiHostnameRequest } from '@/services/services';

export async function GET(req: NextRequest) {
  const { apiHostname } = await getAPIHostnameConfig(req);

  return await makeApiHostnameRequest(apiHostname, `${req.nextUrl.pathname}?${req.nextUrl.searchParams}`);
}
