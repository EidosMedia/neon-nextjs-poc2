import { NextRequest } from 'next/server';
import { getAuthOptions } from '@/utilities/security';
import { getAPIHostnameConfig, handleServicesError } from '../../../services/utils';
import { ErrorObject, SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;

    const foundSite: { apiHostname: string; viewStatus: string; root: SiteNode } = await getAPIHostnameConfig(request);

    const promoteContentLive = await connection.promoteContentLive({
      id: id,
      auth: await getAuthOptions(),
      sites: foundSite.root.name,
    });
    return Response.json({ ...promoteContentLive });
  } catch (error) {
    return handleServicesError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;

    const foundSite: { apiHostname: string; viewStatus: string; root: SiteNode } = await getAPIHostnameConfig(request);

    const unpromoteContentLive = await connection.unpromoteContentLive({
      id: id,
      sites: foundSite.root.name,
      auth: await getAuthOptions(),
    });

    return Response.json({ ...unpromoteContentLive });
  } catch (error) {
    return handleServicesError(error);
  }
}
