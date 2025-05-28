import { getAPIHostnameConfig } from '@/services/utils';
import { NextRequest } from 'next/server';
import { authenticationHeader } from '@/utilities/security';

export async function GET(req: NextRequest) {

  try {
    const { apiHostname } = await getAPIHostnameConfig(req);

    const authHeaders = await authenticationHeader(true);

    const ragsearch = req.nextUrl.searchParams.get("rag") === "true" 
    const naturalsearch = req.nextUrl.searchParams.get("rag") === "false" 

    const url = ragsearch || naturalsearch ? '/api/search/natural' : '/api/search';

    if (!(ragsearch || naturalsearch)) {
      req.nextUrl.searchParams.append('baseType', 'article')
      req.nextUrl.searchParams.append('baseType', 'liveblog');
    }

    const resp = await fetch(`${apiHostname}${url}?${req.nextUrl.searchParams}`, {
      headers: {
        ...authHeaders,
      },
    });

    return resp;
  } catch (error) {
    console.log('Error in search POST request:', error);
    return Response.json(
      (error instanceof Error && error.cause instanceof Response) ? { error: error.cause.statusText } : { error: 'Internal Server Error' },
      (error instanceof Error && error.cause instanceof Response) ? { status: error.cause.status } : { status: 500 });
  }  
}
