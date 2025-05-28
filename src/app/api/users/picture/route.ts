import { authenticationHeader } from '@/utilities/security';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
   const authHeaders = await authenticationHeader(false);
 
  const userId = request.nextUrl.searchParams.get('id') || '';

  return await connection.getUserAvatar({
    id: userId,
    headers: { ...authHeaders },
  });
}
