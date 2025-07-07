import { cookies } from 'next/headers';
import {AuthContext} from "@/neon-frontoffice-ts-sdk/src";

type AuthenticationHeaderProps = {
  Authorization?: string;
  'neon-fo-access-key'?: string;
};

export async function authenticationHeader(foAccessKey: boolean): Promise<AuthenticationHeaderProps> {
  const cookiesFromRequest = await cookies();
  const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

  if (!previewtoken && !foAccessKey) {
    return {};
  }

  const headers: AuthenticationHeaderProps = {};

  if (previewtoken) {
    headers.Authorization = `Bearer ${previewtoken}`;
  }

  headers['neon-fo-access-key'] = process.env.NEON_FRONTOFFICE_SERVICE_KEY || '';

  return headers;
}

export const getAuthOptions = async (contextId?: string): Promise<AuthContext> => {
  const cookiesFromRequest = await cookies();
  const editorialAuth = cookiesFromRequest.get('previewtoken')?.value;
  const webAuth = cookiesFromRequest.get('webAuth')?.value;

  return {
    editorialAuth: editorialAuth,
    webAuth: webAuth,
    contextId: contextId,
  };
};
