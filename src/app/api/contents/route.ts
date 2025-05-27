import { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';
import { getAPIHostnameConfig } from '../../../services/utils';
import { SiteNode } from '@/neon-frontoffice-ts-sdk/src';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;
    const cookiesFromRequest = await cookies();
    const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

    const foundSite: { apiHostname: string; viewStatus: string; root: SiteNode } = await getAPIHostnameConfig(request);

    const promoteContentLive = await connection.promoteContentLive({
      id: id,
      headers: {
        Authorization: `Bearer ${previewtoken}`,
      },
      sites: foundSite.root.name,
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
    const cookiesFromRequest = await cookies();
    const previewtoken = cookiesFromRequest.get('previewtoken')?.value;
    const foundSite: { apiHostname: string; viewStatus: string; root: SiteNode } = await getAPIHostnameConfig(request);

    const unpromoteContentLive = await connection.unpromoteContentLive({
      id: id,
      sites: foundSite.root.name,
      headers: {
        Authorization: `Bearer ${previewtoken}`,
      },
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
