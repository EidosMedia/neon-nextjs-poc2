import { NextRequest } from 'next/server';
import { getAPIHostnameConfig } from '@/services/utils';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const { apiHostname } = await getAPIHostnameConfig(req);

  const cookiesFromRequest = await cookies();
  const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

  const resp = await fetch(`${apiHostname}${req.nextUrl.pathname}?${req.nextUrl.searchParams}`, {
    headers: { Authorization: `Bearer ${previewtoken}` ,'neon-fo-access-key': process.env.NEON_FRONTOFFICE_SERVICE_KEY || ''},
  });
  return resp;
}
