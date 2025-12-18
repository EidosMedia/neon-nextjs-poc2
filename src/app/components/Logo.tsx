/* eslint-disable @next/next/no-img-element */
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';

type SiteLogoProps = {
  data: Partial<PageData<BaseModel>>;
  size?: 'small' | 'medium' | 'large';
};

const SiteLogo: React.FC<SiteLogoProps> = async ({ data, size = 'medium' }) => {
  const siteName = data.siteData?.siteName || data.siteNode?.name;
  if (!siteName) {
    throw new Error('Site node data is missing');
  }
  const site = await connection.findSite(siteName);

  if (!site) {
    throw new Error('Site not found');
  }

  const height = size === 'small' ? 30 : size === 'large' ? 80 : 50; // default to medium

  return (
    <Link className="flex items-center" href="/">
      <img src={site.logoUrl || undefined} alt={''} style={{ height: `${height}px` }} />
    </Link>
  );
};

export default SiteLogo;
