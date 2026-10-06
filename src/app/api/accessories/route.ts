import { NextRequest, NextResponse } from 'next/server';
import defaultAccessoryDefinitions from '@/lib/accessories/accessory.json';

export async function GET(request: NextRequest) {
  const headerName = process.env.INVALIDATE_NEXTJS_HEADER_NAME ?? 'invalidate-secret';
  const expectedSecret = process.env.INVALIDATE_NEXTJS_HEADER_VALUE;
  const suppliedSecret = request.headers.get(headerName);
  if (!expectedSecret || !suppliedSecret || suppliedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Not Found - Invalid Call' }, { status: 404 });
  }

  const theme = request.nextUrl.searchParams.get('theme');
  if (!theme) {
    return NextResponse.json({ error: 'A theme is required.' }, { status: 400 });
  }
  if (theme !== defaultAccessoryDefinitions.theme) {
    return NextResponse.json({ error: 'Theme definitions were not found.' }, { status: 404 });
  }

  return NextResponse.json(defaultAccessoryDefinitions);
}