import { NextRequest } from 'next/server';
import { authenticationHeader } from '@/utilities/security';
import { getAPIHostnameConfig, handleServicesError } from '../../../services/utils';
import { ErrorObject, SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body?.id;

    const foundSite: { apiHostname: string; viewStatus: string; root: SiteNode } = await getAPIHostnameConfig(request);
    const authHeaders = await authenticationHeader(false);

    if (!authHeaders.Authorization) {
      throw new Error('Authorization header is missing');
    }

    const promoteContentLive = await connection.promoteContentLive({
      id: id,
      headers: {
        Authorization: authHeaders.Authorization,
      },
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

    const authHeaders = await authenticationHeader(false);
    const foundSite: { apiHostname: string; viewStatus: string; root: SiteNode } = await getAPIHostnameConfig(request);

    if (!authHeaders.Authorization) {
      throw new Error('Authorization header is missing');
    }

    const unpromoteContentLive = await connection.unpromoteContentLive({
      id: id,
      sites: foundSite.root.name,
      headers: {
        Authorization: authHeaders.Authorization,
      },
    });

    return Response.json({ ...unpromoteContentLive });
  } catch (error) {
    return handleServicesError(error);
  }
}
