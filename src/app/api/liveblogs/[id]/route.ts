import { getAPIHostnameConfig } from '@/services/utils';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
// import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { apiHostname } = await getAPIHostnameConfig(req);

  const id = (await params).id;

  const cookiesFromRequest = await cookies();
  const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

  const resp = await fetch(`${apiHostname}/api/v2/liveblogs/${id}/posts?${req.nextUrl.searchParams}`, {
    headers: {
      Authorization: `Bearer ${previewtoken}`,
      'neon-fo-access-key': process.env.NEON_FRONTOFFICE_SERVICE_KEY || '',
    },
  });

  return resp;
}
