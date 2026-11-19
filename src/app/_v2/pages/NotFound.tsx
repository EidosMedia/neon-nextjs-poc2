import Link from 'next/link';
import type { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';

/** 404 inside the v2 frame. */
export default function NotFound({ data }: { data: Site }) {
  return (
    <PageShell site={data}>
      <div className="v2-container v2-special v2-special--notfound">
        <p className="v2-special__code">404</p>
        <h1 className="v2-special__title">This page is no longer available.</h1>
        <p>
          The page you are trying to visit does not exist or has been removed. Check that the URL is correct, use the
          search to find the content, or <Link href="/">go to the homepage</Link>.
        </p>
      </div>
    </PageShell>
  );
}
