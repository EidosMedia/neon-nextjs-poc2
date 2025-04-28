import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    const cookiesFromRequest = await cookies();
    const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

    const promoteContentLive = await connection.promoteContentLive({
      id: id,
      headers: {
        Authorization: `Bearer ${previewtoken}`,
      },
      baseUrl: process.env.BASE_NEON_FE_URL || '',
    });
    return Response.json({ ...promoteContentLive });
  } catch (error) {
    console.log('Error in DELETE request:', error);
    console.log(error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    const cookiesFromRequest = await cookies();
    const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

    const unpromoteContentLive = await connection.unpromoteContentLive({
      id: id,
      headers: {
        Authorization: `Bearer ${previewtoken}`,
      },
      baseUrl: process.env.BASE_NEON_FE_URL || '',
    });
    return Response.json({ ...unpromoteContentLive });
  } catch (error) {
    console.log('Error in DELETE request:', error);
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
