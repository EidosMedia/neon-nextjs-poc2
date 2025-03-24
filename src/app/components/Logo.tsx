/* eslint-disable @next/next/no-img-element */
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';

type SiteLogoProps = {
  data: PageData<BaseModel>;
  size?: 'small' | 'medium' | 'large';
};

const SiteLogo: React.FC<SiteLogoProps> = async ({ data }) => {
  const site = await connection.getSiteByName(data.siteNode.name);

  if (!site) {
    throw new Error('Site not found');
  }

  return (
    <Link className="flex items-center" href="/">
      <img src={site.logoUrl || null} alt={''} style={{ height: '80px' }} />
    </Link>
  );
};

export default SiteLogo;
