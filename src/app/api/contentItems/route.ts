import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    const contentItemId = body?.contentItemId;
    const payload = body?.payload;

    const cookiesFromRequest = await cookies();
    const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

    const updateContentItem = await connection.updateContentItem({
      id: id,
      contentItemId: contentItemId,
      payload: payload,
      headers: {
        Authorization: `Bearer ${previewtoken}`,
        'update-context-id': Math.random().toString(36).substring(2), // Generate a random value
      },
      baseUrl: process.env.BASE_NEON_FO_URL || '',
    });
    return Response.json({ ...updateContentItem });
  } catch (error) {
    console.log('Error in POST request:', error);
    console.log(error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
