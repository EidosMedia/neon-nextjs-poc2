import { cookies, headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import AboutPage from '../_pages/AboutPage';
import Article from '../_pages/Article';
import DefaultLanding from '../_pages/DefaultLanding';
import DefaultSection from '../_pages/DefaultSection';
import HomeWebPage from '../_pages/HomeWebPage';
import Liveblog from '../_pages/Liveblog';
import SearchPage from '../_pages/SearchPage';
import SectionWebPage from '../_pages/SectionWebPage';
import WebpageColumnsLayout from '../_pages/WebpageColumnsLayout';
import LoggedUserBar from '../components/LoggedUserOverlay/LoggedUserBar';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {

  const currentHeaders = await headers();

  const hostname = currentHeaders.get('x-neon-backend-url');
  const siteName = currentHeaders.get('x-neon-site-name');
  const slug = (await params).slug || [];
  const id = (await searchParams)?.id;

  if (slug && slug.length === 1) {
    const site = await connection.getSiteByName(siteName ?? "");
    switch (slug[0]) {
      case 'search':
        if (site) {
          return (<SearchPage data = {site}/>);
        }
      case 'about':
        if (site) {
          return (<AboutPage data = {site}/>);
        }
    }
   }
 

  const cookiesFromRequest = await cookies();
  const previewtoken = cookiesFromRequest.get('previewtoken')?.value;

  const pageData = await fetch(
    `${hostname}/${slug.join('/')}${!slug.length || slug[slug.length - 1].endsWith('.html') ? '' : '/'}${
      id !== undefined ? (id ? `${id}` : '') : ''
    }`,
    {
      redirect: 'manual',
      headers: {
        Authorization: `Bearer ${previewtoken}`,
        'neon-fo-access-key': process.env.NEON_FRONTOFFICE_SERVICE_KEY || '',
      },
    }
  );

  // handle 404 not found
  if (pageData.status === 404) {
    notFound();
  }

  // handle 401 and 403 unauthorized
  if (pageData.status === 401 || pageData.status === 403) {
    notFound();
  }

  // handle redirection
  if (pageData.status > 300 && pageData.status < 400) {
    const newLocation = pageData.headers.get('Location') as string;
    redirect(newLocation);
  }

  const pageDataJSON = await pageData.json();
  console.log('Current page model', pageDataJSON);

  if (process.env.NODE_ENV === 'development' && pageData.status >= 500) {
    throw new Error(pageDataJSON.model.data.trace);
  }

  const resolvePage = () => {
    switch (pageDataJSON.model?.data?.sys?.baseType) {
      case 'webpage':
        return <WebpageColumnsLayout data={pageDataJSON} />;

      case 'sectionwebpage':
        return <SectionWebPage data={pageDataJSON} />;

      case 'homewebpage':
        return <HomeWebPage data={pageDataJSON} />;

      case 'section':
        return <DefaultSection data={pageDataJSON} />;

      case 'site':
        return <DefaultLanding data={pageDataJSON} />;

      case 'liveblog':
        return <Liveblog data={pageDataJSON} />;

      default:
        return <Article data={pageDataJSON} />;
    }
  };

  return (
    <div className="root" data-theme={pageDataJSON.siteNode.attributes.theme}>
      <LoggedUserBar
        data={{
          ...pageDataJSON,
          editUrl: `${process.env.NEON_APP_URL}/neon/app/#open/${pageDataJSON.model.data.id}`,
        }}
      />
      {resolvePage()}
    </div>
  );
}
