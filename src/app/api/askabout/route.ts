import { RagOnItemsResponse } from '@/neon-frontoffice-ts-sdk/src';
import { getAPIHostnameConfig } from '@/services/utils';
import { NextRequest } from 'next/server';
import { getAuthOptions } from '@/utilities/security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('body', body);

    const familyRefs: string[] = Array.isArray(body) ? body : [];

    const { apiHostname } = await getAPIHostnameConfig(req);

    const resp: RagOnItemsResponse = await connection.askAboutContents({
      query: req.nextUrl.searchParams.get('query') || '',
      ids: familyRefs,
      baseUrl: apiHostname,
      auth: await getAuthOptions(),
    });

    return Response.json(resp, {
      status: resp.statusCode,
    });
  } catch (error) {
    console.log('Error in ask about POST request:', error);
    return Response.json(
      error instanceof Error && error.cause instanceof Response
        ? { error: error.cause.statusText }
        : { error: 'Internal Server Error' },
      error instanceof Error && error.cause instanceof Response ? { status: error.cause.status } : { status: 500 }
    );
  }
}
