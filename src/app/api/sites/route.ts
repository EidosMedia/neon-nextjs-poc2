import { getConnection } from '@/services/utils';

export async function GET() {
  const connection = getConnection();

  const resp = await connection.getSitesList();

  return Response.json(resp);
}
