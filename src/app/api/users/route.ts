import logger from '@/lib/logger';
import { getAPIHostnameConfig, handleServicesError } from '@/services/utils';
import { getEditorAuthOptions } from '@/utilities/security';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { apiHostname } = await getAPIHostnameConfig(request);
    const auth = await getEditorAuthOptions();

    logger.info(
      {
        event: 'users-request',
        forwardedHost: request.headers.get('x-forwarded-host'),
        apiHostname,
        hasEditorialAuth: Boolean(auth.editorialAuth),
        hasWebAuth: Boolean(auth.webAuth),
      },
      'users request',
    );

    const user = await connection.getCurrentUserInfo({ apiHostname, auth });

    logger.info({ event: 'users-resolved', hasName: Boolean(user.name), hasId: Boolean(user.id) }, 'users resolved');
    return Response.json({ ...user });
  } catch (error) {
    logger.error(
      {
        event: 'users-error',
        status: (error as { status?: number }).status,
        message: error instanceof Error ? error.message : String(error),
        cause: (error as { cause?: unknown }).cause,
      },
      'users request failed',
    );
    return handleServicesError(error);
  }
}
