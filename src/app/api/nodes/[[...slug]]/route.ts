import { NextRequest } from 'next/server';
import { getAPIHostnameConfig } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';

export async function GET(req: NextRequest) {
  const { apiHostname } = await getAPIHostnameConfig(req);
  const  auth  = await getAuthOptions();
  return await connection.makeApiRequest(`${req.nextUrl.pathname}?${req.nextUrl.searchParams}`, auth, {}, apiHostname);
}
