import { getAPIHostnameConfig } from '@/services/utils';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {


  const { apiHostname } = await getAPIHostnameConfig(req);

  const cookiesFromRequest = await cookies();
  const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

  const url = req.nextUrl.searchParams.get("rag") === "true" ? '/api/search/natural' : '/api/search';

  const resp = await fetch(`${apiHostname}${url}?${req.nextUrl.searchParams}`, {
    headers: {
      Authorization: `Bearer ${previewtoken}`,
      'neon-fo-access-key': process.env.NEON_FRONTOFFICE_SERVICE_KEY || '',
    },
  });

  return resp;
}
