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
