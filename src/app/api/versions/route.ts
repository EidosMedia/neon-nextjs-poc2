import { NextRequest } from 'next/server';
import { handleServicesError } from '@/services/utils';
import { RollbackVersionOptions } from '@/neon-frontoffice-ts-sdk/src/services/contents';
import { getAuthOptions } from '@/utilities/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetVersion = body?.nodeId;
    const baseType = body?.baseType;

    const rollbackLinks = baseType === 'webpage' || baseType === 'homewebpage' || baseType === 'sectionwebpage';

    const payload: RollbackVersionOptions = {
      version: targetVersion,
      rollbackLinks: rollbackLinks,
      rollbackMetadata: false,
      auth: await getAuthOptions(),
    };

    console.log('calling with', payload);

    const response = await connection.rollbackVersion(payload);

    return Response.json({ ...response });
  } catch (error) {
    return handleServicesError(error);
  }
}
