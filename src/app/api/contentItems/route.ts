import { NextRequest } from 'next/server';
import { authenticationHeader } from '@/utilities/security';
import { ErrorObject } from '@/neon-frontoffice-ts-sdk/src';
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
      contextId: 'Neon-poc:' + Math.random().toString(36).substring(2), // Generate a random value
      editorialToken: request.cookies.get('previewtoken')?.value || '',
    });

    return Response.json({ ...updateContentItem });
  } catch (error) {
    return handleServicesError(error);
  }
}
