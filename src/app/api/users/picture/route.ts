import { getAuthOptions } from '@/utilities/security';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('id') || '';

  return await connection.getUserAvatar({
    id: userId,
    auth: await getAuthOptions(),
  });
}
