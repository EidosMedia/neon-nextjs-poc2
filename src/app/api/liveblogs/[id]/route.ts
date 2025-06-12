import { getAPIHostnameConfig } from '@/services/utils';
import { NextRequest } from 'next/server';
import { getAuthOptions } from '@/utilities/security';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { apiHostname } = await getAPIHostnameConfig(req);

  const id = (await params).id;
  const searchParams = req.nextUrl.searchParams;

  return await connection.getLiveBlogsPosts({ apiHostname, id, searchParams, auth: await getAuthOptions() });
}
