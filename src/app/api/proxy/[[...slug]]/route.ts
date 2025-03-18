import { NextRequest, NextResponse } from 'next/server';
import { getAPIHostnameConfig } from '@/services/utils';

export async function GET(req: NextRequest, res: NextResponse) {
  const { apiHostname } = await getAPIHostnameConfig(req);
  const resp = await fetch(
    `${apiHostname}${req.nextUrl.pathname}?${req.nextUrl.searchParams}`
  );
  return resp;
}
