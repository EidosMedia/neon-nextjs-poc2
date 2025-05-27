import { NextRequest } from 'next/server';
import { authenticationHeader } from '@/utilities/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    const authHeaders = await authenticationHeader(false);
   
    const promoteContentLive = await connection.promoteContentLive({
      id: id,
      headers: {
        ...authHeaders,
      },
      baseUrl: process.env.BASE_NEON_FE_URL || '',
    });
    return Response.json({ ...promoteContentLive });
  } catch (error) {
    console.log('Error in POST request:', error);
    console.log(error);
    return Response.json(
      {
        error: {
          message: 'Unable to promote the item',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    const authHeaders = await authenticationHeader(false);

    const unpromoteContentLive = await connection.unpromoteContentLive({
      id: id,
      headers: {
        ...authHeaders,
      },
      baseUrl: process.env.BASE_NEON_FE_URL || '',
    });
    return Response.json({ ...unpromoteContentLive });
  } catch (error) {
    console.log('Error in DELETE request:', error);
    console.log(error);
    return Response.json(
      {
        error: {
          message: 'Unable to unpromote the item',
        },
      },
      { status: 500 }
    );
  }
}
