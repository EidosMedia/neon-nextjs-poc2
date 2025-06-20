import { AuthContext } from '@/neon-frontoffice-ts-sdk/src';
import { cookies } from 'next/headers';

type AuthenticationHeaderProps = {
  Authorization?: string;
  'neon-fo-access-key'?: string;
};

export async function authenticationHeader(foAccessKey: boolean): Promise<AuthenticationHeaderProps> {
  const cookiesFromRequest = await cookies();
  const editorialauth = cookiesFromRequest.get('editorialauth')?.value;

  if (!editorialauth && !foAccessKey) {
    return {};
  }

  const headers: AuthenticationHeaderProps = {};

  if (editorialauth) {
    headers.Authorization = `Bearer ${editorialauth}`;
  }

  headers['neon-fo-access-key'] = process.env.NEON_FRONTOFFICE_SERVICE_KEY || '';

  return headers;
}

export const getAuthOptions = async (contextId?: string): Promise<AuthContext> => {
  const cookiesFromRequest = await cookies();
  const editorialAuth = cookiesFromRequest.get('editorialauth')?.value;
  const webAuth = cookiesFromRequest.get('webauth')?.value;

  return {
    editorialAuth: editorialAuth,
    webAuth: webAuth,
    contextId: contextId,
  };
};
