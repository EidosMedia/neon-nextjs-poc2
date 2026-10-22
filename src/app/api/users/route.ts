import { getAPIHostnameConfig, handleServicesError } from '@/services/utils';
import { getEditorAuthOptions } from '@/utilities/security';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { apiHostname } = await getAPIHostnameConfig(request);
    const user = await connection.getCurrentUserInfo({
      apiHostname,
      auth: await getEditorAuthOptions(),
    });
    return Response.json({ ...user });
  } catch (error) {
    return handleServicesError(error);
  }
}
