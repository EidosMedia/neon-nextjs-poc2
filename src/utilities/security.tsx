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

// makeRequest sends webAuth before editorialAuth, so the reader token is dropped when an editor token exists.
export const getEditorAuthOptions = async (contextId?: string): Promise<AuthContext> => {
  const auth = await getAuthOptions(contextId);
  return auth.editorialAuth ? { ...auth, webAuth: undefined } : auth;
};
