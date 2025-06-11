import { cookies } from 'next/headers';

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

  return headers;
}

export const getAuthOptions = async () => {
  const cookiesFromRequest = await cookies();
  const editorialAuth = cookiesFromRequest.get('previewtoken')?.value;
  const webAuth = cookiesFromRequest.get('webAuth')?.value;

  return {
    editorialAuth: editorialAuth,
    webAuth: webAuth,
  };
};
