import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { handleServicesError } from '@/services/utils';
import { RollbackVersionOptions } from '@/neon-frontoffice-ts-sdk/src/services/contents';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetVersion = body?.nodeId;
    const baseType = body?.baseType;

    const rollbackLinks = baseType === 'webpage' || baseType === 'homewebpage' || baseType === 'sectionwebpage';

    const cookiesFromRequest = await cookies();
    const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

    const payload: RollbackVersionOptions = {
      version: targetVersion,
      rollbackLinks: rollbackLinks,
      rollbackMetadata: false,
      headers: {
        Authorization: `Bearer ${previewtoken}`,
        'Content-Type': 'application/json',
        'update-context-id': Math.random().toString(36).substring(2), // Generate a random value
      },
    };

    console.log('calling with', payload);

    const response = await connection.rollbackVersion(payload);

    return Response.json({ ...response });
  } catch (error) {
    return handleServicesError(error);
  }
}
