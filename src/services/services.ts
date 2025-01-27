export const getPageData = async (hostname: string, slug: string[]) => {
  const pageData = await fetch(`${hostname}/${slug.join('/')}`);
  const pageDataJSON = await pageData.json();
  return pageDataJSON;
};
