import { NextRequest } from 'next/server';
import { authenticationHeader } from '@/utilities/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    const contentItemId = body?.contentItemId;
    const payload = body?.payload;
    const authHeaders = await authenticationHeader(false);

    const headers = {
      Authorization: authHeaders.Authorization as string,
      // 'update-context-id': Math.random().toString(36).substring(2), // Generate a random value
    };

    const updateContentItem = await connection.updateContentItem({
      id: id,
      contentItemId: contentItemId,
      payload: payload,
      headers: headers,
      baseUrl: process.env.BASE_NEON_FO_URL || '',
    });
    return Response.json({ ...updateContentItem });
  } catch (error) {
    console.log('Error in POST request:', error);
    console.log(error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
