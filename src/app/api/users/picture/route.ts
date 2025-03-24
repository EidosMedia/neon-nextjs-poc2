import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const cookiesFromRequest = await cookies();
  const previewToken = cookiesFromRequest.get('previewtoken')?.value;
  const userId = request.nextUrl.searchParams.get('id') || '';

  return await connection.getUserAvatar({
    id: userId,
    headers: { Authorization: `Bearer ${previewToken}` },
  });
}
