import { getAuthOptions } from '@/utilities/security';

export async function GET() {
  const auth = await getAuthOptions();

  if (process.env.NODE_ENV === 'development') {
    console.info('neon-fo:auth-context', {
      hasEditorialAuth: !!auth.editorialAuth,
      hasWebAuth: !!auth.webAuth,
    });
  }

  return Response.json({
    hasEditorialAuth: !!auth.editorialAuth,
    hasWebAuth: !!auth.webAuth,
  });
}
