import { NextRequest } from 'next/server';
import { handleServicesError } from '@/services/utils';
import { RollbackVersionOptions } from '@/neon-frontoffice-ts-sdk/src/services/contents';
import { getAuthOptions } from '@/utilities/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetVersion = body?.nodeId;
    const payload: RollbackVersionOptions = {
      version: targetVersion,
      rollbackLinks: true,
      rollbackMetadata: false,
      auth: await getAuthOptions(Math.random().toString(36).substring(2)),
    };

    const response = await connection.rollbackVersion(payload);

    return Response.json({ ...response });
  } catch (error) {
    return handleServicesError(error);
  }
}
