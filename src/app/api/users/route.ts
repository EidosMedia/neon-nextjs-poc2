import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const headers = request.headers;
  const cookiesFromRequest = await cookies();
  const previewtoken = cookiesFromRequest.get('previewtoken')?.value;
  const user = await connection.getCurrentUserInfo({
    headers: { Authorization: `Bearer ${previewtoken}` },
  });

  console.log('===========user', user);

  return Response.json({ user })
}
