import { getAPIHostnameConfig } from '@/services/utils';
import { NextRequest } from 'next/server';
import { getAuthOptions } from '@/utilities/security';

export async function GET(req: NextRequest) {
  try {
    const { apiHostname } = await getAPIHostnameConfig(req);

    const result = await connection.search({
      apiHostname,
      searchParams: req.nextUrl.searchParams,
      auth: await getAuthOptions()
    });

    return Response.json(result);
  } catch (error) {
    console.log('Error in search POST request:', error);
    return Response.json(
      error instanceof Error && error.cause instanceof Response
        ? { error: error.cause.statusText }
        : { error: 'Internal Server Error' },
      error instanceof Error && error.cause instanceof Response ? { status: error.cause.status } : { status: 500 }
    );
  }
}
