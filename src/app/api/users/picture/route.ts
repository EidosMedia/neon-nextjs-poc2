import { handleServicesError } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';
import { ErrorObject } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('id') || '';

    return await connection.getUserAvatar({
      id: userId,
      auth: await getAuthOptions(),
    });
  } catch (error) {
    // Backend returns 406 when the user has no avatar set, not as an actual error.
    if ((error as ErrorObject).status === 406) {
      return NextResponse.redirect(new URL('/default-avatar.svg', request.url));
    }

    return handleServicesError(error);
  }
}
