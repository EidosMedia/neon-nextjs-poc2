import { authenticationHeader } from '@/utilities/security';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const cookiesFromRequest = await cookies();
  const authHeaders = await authenticationHeader(true);

  const userId = request.nextUrl.searchParams.get('id') || '';

  const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

  return await connection.getUserAvatar({
    id: userId,
    editorialAuth: previewtoken,
  });
}
