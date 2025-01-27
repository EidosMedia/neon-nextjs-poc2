import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const currentHeaders = await headers();

  console.log('currentHeaders', currentHeaders);
  const hostname = currentHeaders.get('x-neon-backend-url');
  const slug = (await params).slug || [];

  console.log(
    'url',
    `${hostname}/${slug.join('/')}${
      !slug.length || slug[slug.length - 1].endsWith('.html') ? '' : '/'
    }`
  );

  const pageData = await fetch(
    `${hostname}/${slug.join('/')}${
      !slug.length || slug[slug.length - 1].endsWith('.html') ? '' : '/'
    }`,
    {
      redirect: 'manual',
    }
  );

  // handle 404 not found
  if (pageData.status === 404) {
    console.log('pre calling revalidate');
    revalidateTag('sites');
    notFound();
  }

  if (pageData.status === 401) {
    console.log('Unauthorized');
    // revalidateTag('sites');
    notFound();
  }

  // handle redirect status
  if (pageData.status > 300 && pageData.status < 400) {
    console.log('newLocation', pageData.headers.get('Location'));
    const newLocation = pageData.headers.get('Location') as string;
    redirect(newLocation);
  }

  const pageDataJSON = await pageData.json();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Page data: {JSON.stringify(pageDataJSON)}
    </main>
  );
}
