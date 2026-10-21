import { handleServicesError } from '@/services/utils';
import { getEditorAuthOptions } from '@/utilities/security';

export async function GET(request: Request) {
  try {
    const user = await connection.getCurrentUserInfo({
      auth: await getEditorAuthOptions(),
    });
    return Response.json({ ...user });
  } catch (error) {
    return handleServicesError(error);
  }
}
