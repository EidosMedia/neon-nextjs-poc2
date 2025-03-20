import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookiesFromRequest = await cookies();
  const previewToken = cookiesFromRequest.get('previewtoken')?.value;

  try {
    const user = await connection.getCurrentUserInfo({
      headers: { Authorization: `Bearer ${previewToken}` },
    });
    return Response.json({ ...user });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
