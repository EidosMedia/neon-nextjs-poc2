import { cookies } from 'next/headers';

export async function GET(request: Request) {
  // For example, fetch data from your DB here

  console.log('request', request);
  const headers = request.headers;
  const cookiesFromRequest = await cookies();
  console.log('cookies', cookiesFromRequest);
  const previewtoken = cookiesFromRequest.get('previewtoken')?.value;
  console.log('================ previewtoken', previewtoken);
  const user = connection.getCurrentUserInfo({
    headers: { Authorization: `Bearer ${previewtoken}` },
  });

  return Response.json({ user })
}
