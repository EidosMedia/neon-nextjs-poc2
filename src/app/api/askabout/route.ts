import { getAPIHostnameConfig } from '@/services/utils';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {


  const body = await req.json();
  console.log('body', body);
  const payload = body;

  const { apiHostname } = await getAPIHostnameConfig(req);
  const cookiesFromRequest = await cookies();
  const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

  const url = '/api/augmented-search/public/liveindex/rag';

  console.log('body', body);
  console.log(url, ' with ', previewtoken, ' payload:', payload, 'params', req.nextUrl.searchParams);

  const resp = await fetch(`${apiHostname}${url}?${req.nextUrl.searchParams}`, {
    headers: {
      Authorization: `Bearer ${previewtoken}`,
      'neon-fo-access-key': process.env.NEON_FRONTOFFICE_SERVICE_KEY || '',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    
    body: JSON.stringify(
      payload
    )
  });

  // console.log(resp.status, "-->", resp.text());

  return resp;
}
