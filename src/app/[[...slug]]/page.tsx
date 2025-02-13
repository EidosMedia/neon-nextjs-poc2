import { headers } from "next/headers";
import { redirect, notFound, unauthorized } from "next/navigation";
import Section from "../_pages/Section";
import Landing from "../_pages/Landing";
import Article from "../_pages/Article";
import Webpage from "../_pages/Webpage";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentHeaders = await headers();

  const hostname = currentHeaders.get("x-neon-backend-url");
  const slug = (await params).slug || [];
  const id = (await searchParams)?.id;

  const pageData = await fetch(
    `${hostname}/${slug.join("/")}${
      !slug.length || slug[slug.length - 1].endsWith(".html") ? "" : "/"
    }${id !== undefined ? (id ? `${id}` : "") : ""}`,
    {
      redirect: "manual",
    }
  );

  // handle 404 not found
  if (pageData.status === 404) {
    notFound();
  }

  // handle 401 and 403 unauthorized
  if (pageData.status === 401 || pageData.status === 403) {
    unauthorized();
  }

  // handle redirection
  if (pageData.status > 300 && pageData.status < 400) {
    const newLocation = pageData.headers.get("Location") as string;
    redirect(newLocation);
  }

  const pageDataJSON = await pageData.json();

  switch (pageDataJSON.model?.data?.sys?.baseType) {
    case "webpage":
      return <Webpage data={pageDataJSON} />;

    case "sectionwebpage":
      return <Section data={pageDataJSON} />;

    case "homewebpage":
      return <Landing data={pageDataJSON} />;

    case "section":
      return <Section data={pageDataJSON} />;

    case "site":
      return <Landing data={pageDataJSON} />;

    // case 'liveblog':
    //   return <LiveblogPage pageDataJSON={pageDataJSON} />;

    default:
      return <Article data={pageDataJSON} />;
  }
}
