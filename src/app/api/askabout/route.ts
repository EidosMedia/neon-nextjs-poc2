import { RagOnItemsResponse } from '@/neon-frontoffice-ts-sdk/src';
import { getAPIHostnameConfig } from '@/services/utils';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    console.log('body', body);

    const familyRefs : string[] = Array.isArray(body) ? body : [];
  
    const { apiHostname } = await getAPIHostnameConfig(req);
    const cookiesFromRequest = await cookies();
    const previewtoken = cookiesFromRequest.get('previewtoken')?.value;
    const headers = {
      Authorization: `Bearer ${previewtoken}`,
      'neon-fo-access-key': process.env.NEON_FRONTOFFICE_SERVICE_KEY || '',
      'Content-Type': 'application/json'
    }

    const resp : RagOnItemsResponse = await connection.askAboutContents({
      query: req.nextUrl.searchParams.get('query') || '',
      ids: familyRefs,
      baseUrl: apiHostname,
      headers: headers,
    });

    return Response.json(resp, {
      status: resp.statusCode,
    });
  } catch (error) {
    console.log('Error in aksabout POST request:', error);
    return Response.json( 
      (error instanceof Error && error.cause instanceof Response) ? { error: error.cause.statusText } : {error: 'Internal Server Error' }, 
      (error instanceof Error && error.cause instanceof Response) ? { status: error.cause.status } : { status: 500 });
  }  
}
