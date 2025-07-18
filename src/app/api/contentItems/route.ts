import { NextRequest } from 'next/server';
import { getAuthOptions } from '@/utilities/security';
import { handleServicesError } from '@/services/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    const contentItemId = body?.contentItemId;
    const payload = body?.payload;

    const updateContentItem = await connection.updateContentItem({
      id: id,
      contentItemId: contentItemId,
      payload: payload,
      auth: await getAuthOptions('Neon-poc:' + Math.random().toString(36).substring(2)),
    });

    return Response.json({ ...updateContentItem });
  } catch (error) {
    return handleServicesError(error);
  }
}
