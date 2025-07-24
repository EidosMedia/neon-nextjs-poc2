import { headers } from 'next/headers';
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
import type { Metadata } from 'next';
import { authenticationHeader } from '@/utilities/security';
import TempEntryPage from '../components/baseComponents/TempEntryPage';
import LoginPage from '../_pages/LoginPage';

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
  const viewStatus = currentHeaders.get('x-neon-view-status') as string;
  const slug = (await params).slug || [];
  const id = (await searchParams)?.id;

  if (slug && slug.length === 1) {
    const site = await connection.getSiteByName(siteName ?? '');

    switch (slug[0]) {
      case 'ui':
        return <TempEntryPage />;

      case 'search':
        if (site) {
          return (
            <div className="root" data-theme={site.root.attributes?.theme}>
              <LoggedUserBar data={{ siteData: { ...site, viewStatus } }} />
              <SearchPage data={site} />
            </div>
          );
        }
      case 'about':
        if (site) {
          return (
            <div className="root" data-theme={site.root.attributes?.theme}>
              <LoggedUserBar data={{ siteData: { ...site, viewStatus } }} />
              <AboutPage data={site} />
            </div>
          );
        }
      case 'login':
        if (site) {
          return (
            <div className="root" data-theme={site.root.attributes?.theme}>
              <LoggedUserBar data={{ siteData: { ...site, viewStatus } }} />
              <LoginPage data={site} />
            </div>
          );
        }
    }
  }

  const authHeaders = await authenticationHeader(true);

  const url = resolveUrl(hostname, slug, id as string);

  const pageData = await fetch(url, {
    redirect: 'manual',
    headers: {
      ...authHeaders,
    },
    cache: 'no-cache',
  });

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

  if (pageDataJSON.model.data.httpStatusCode === 410) {
    notFound();
  }

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
          editUrl: `${process.env.NEON_APP_URL}/neon/app/neon.html#open/${pageDataJSON.model.data.id}`,
        }}
      />
      {resolvePage()}
    </div>
  );
}

function resolveUrl(hostname: string | null, slug: string[], id?: string | null) {
  const baseUrl = `${hostname}/${slug.join('/')}`;
  return id !== undefined && id ? `${baseUrl.replace(/\/$/, '')}/${id}` : baseUrl;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const currentHeaders = await headers();

  const hostname = currentHeaders.get('x-neon-backend-url');
  const slug = (await params).slug || [];
  const id = (await searchParams)?.id;
  const authHeaders = await authenticationHeader(true);

  const url = resolveUrl(hostname, slug, id as string);

  const pageData = await fetch(url, {
    redirect: 'manual',
    headers: {
      ...authHeaders,
    },
    cache: 'no-cache',
  });

  const pageDataJSON = await pageData.json();
  let title;

  if (slug && slug.length === 1) {
    switch (slug[0]) {
      case 'search':
        title = 'Search';
        break;
      case 'about':
        title = 'About';
        break;
      case 'login':
        title = 'Login';
        break;
    }
  }

  if (!title) {
    title = pageDataJSON.model.data.title;
  }

  return {
    title: `${pageDataJSON.siteData.siteName} - ${title}`,
    description: pageDataJSON.model.data.summary,
  };
}
