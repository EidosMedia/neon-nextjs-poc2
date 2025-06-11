import { handleServicesError } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';

export async function GET(request: Request) {
  try {
    const user = await connection.getCurrentUserInfo({
      auth: await getAuthOptions(),
    });
    return Response.json({ ...user });
  } catch (error) {
    return handleServicesError(error);
  }
}
