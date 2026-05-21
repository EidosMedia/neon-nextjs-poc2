import { NextRequest } from 'next/server';
import { getAPIHostnameConfig, handleServicesError } from '@/services/utils';
import { getAuthOptions } from '@/utilities/security';

/**
 * GET /api/embed/[id]
 *
 * Resolves a `neon://{id}` reference by fetching the corresponding CMS node
 * data and returning it as JSON.  Custom components that carry an
 * `href="neon://{id}"` attribute use this endpoint to receive the embedded
 * node payload as a `nodeData` prop.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { apiHostname } = await getAPIHostnameConfig(req);
    const auth = await getAuthOptions();
    const id = (await params).id;

    const response = await connection.makeApiRequest(`/api/nodes/${id}`, auth, {}, apiHostname);
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return handleServicesError(error);
  }
}
