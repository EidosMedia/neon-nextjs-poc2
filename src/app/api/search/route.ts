import { getAPIHostnameConfig } from '@/services/utils';
import { NextRequest } from 'next/server';
import { makeRequest } from '@/services/services';

export async function GET(req: NextRequest) {
  try {
    const { apiHostname } = await getAPIHostnameConfig(req);

    const ragsearch = req.nextUrl.searchParams.get('rag') === 'true';
    const naturalsearch = req.nextUrl.searchParams.get('rag') === 'false';

    const url = ragsearch || naturalsearch ? '/api/search/natural' : '/api/search';

    if (!(ragsearch || naturalsearch)) {
      req.nextUrl.searchParams.append('baseType', 'article');
      req.nextUrl.searchParams.append('baseType', 'liveblog');
    }

    return await makeRequest(apiHostname, `${url}?${req.nextUrl.searchParams}`);
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
