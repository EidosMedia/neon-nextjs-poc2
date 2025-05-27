import { authenticationHeader } from '@/utilities/security';

export async function GET(request: Request) {
     const authHeaders = await authenticationHeader(false);

  try {
      const user = await connection.getCurrentUserInfo({
        headers: { ...authHeaders },
      });
      return Response.json({ ...user });
    
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
