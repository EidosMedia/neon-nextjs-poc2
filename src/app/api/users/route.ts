import { cookies } from 'next/headers';

export async function GET(request: Request) {
  // For example, fetch data from your DB here

  console.log('request', request);
  const headers = request.headers;
  const cookiesFromRequest = await cookies();
  console.log('cookies', cookiesFromRequest);
  const emauth = cookiesFromRequest.get('emauth')?.value;
  console.log('emauth', emauth);
  return connection.getCurrentUserInfo({
    headers: { Authorization: `Bearer ${emauth}` },
  });
}
