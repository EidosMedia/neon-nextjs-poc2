import { AuthContext } from '@/neon-frontoffice-ts-sdk/src';
import { cookies } from 'next/headers';

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
