import { handleServicesError } from '@/services/utils';
import { authenticationHeader } from '@/utilities/security';

export async function GET(request: Request) {
  const authHeaders = await authenticationHeader(false);

  try {
    const user = await connection.getCurrentUserInfo({
      headers: { ...authHeaders },
    });
    return Response.json({ ...user });
  } catch (error) {
    return handleServicesError(error);
  }
}
