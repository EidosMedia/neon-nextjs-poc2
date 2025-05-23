import { getAPIHostnameConfig } from '@/services/utils';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {


  const { apiHostname } = await getAPIHostnameConfig(req);

  const cookiesFromRequest = await cookies();
  const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

  const ragsearch = req.nextUrl.searchParams.get("rag") === "true" 

  const url = ragsearch ? '/api/search/natural' : '/api/search';

  if (!ragsearch) {
    req.nextUrl.searchParams.append('baseType', 'article')
    req.nextUrl.searchParams.append('baseType', 'liveblog');
  }

  const resp = await fetch(`${apiHostname}${url}?${req.nextUrl.searchParams}`, {
    headers: {
      Authorization: `Bearer ${previewtoken}`,
      'neon-fo-access-key': process.env.NEON_FRONTOFFICE_SERVICE_KEY || '',
    },
  });

  return resp;
}
