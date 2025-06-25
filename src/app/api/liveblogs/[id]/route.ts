import { getAPIHostnameConfig } from '@/services/utils';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthOptions } from '@/utilities/security';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { apiHostname } = await getAPIHostnameConfig(req);

  const id = (await params).id;
  const searchParams = req.nextUrl.searchParams;

  const result = await connection.getLiveBlogsPosts({ apiHostname, id, searchParams, auth: await getAuthOptions() });

  return NextResponse.json(result);
}
