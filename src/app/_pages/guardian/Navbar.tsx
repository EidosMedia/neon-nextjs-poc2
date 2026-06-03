import Link from 'next/link';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { Search } from 'lucide-react';
import { cookies } from 'next/headers';
import LoginButton from '../../components/LoginButton';

const PILLARS = [
  { label: 'News',      href: '/news' },
  { label: 'Opinion',   href: '/opinion' },
  { label: 'Sport',     href: '/sport' },
  { label: 'Culture',   href: '/culture' },
  { label: 'Lifestyle', href: '/lifestyle' },
];

export default async function Navbar({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: guardian/Navbar');

  const cookieStore = await cookies();
  const webauth = cookieStore.get('webauth')?.value;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="guardian-header w-full">

      {/* ── Row 1: Pillars bar ────────────────────────────────────────────── */}
      <div className="w-full" style={{ height: 36 }}>
        <div className="w-full max-w-[1300px] mx-auto px-4 flex items-center justify-between h-full">
          <nav className="flex items-center h-full">
            {PILLARS.map(({ label, href }) => (
              <Link key={href} href={href} className="guardian-pillar-link flex items-center h-full">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/subscribe" className="guardian-subscribe-link">Subscribe</Link>
            <a href="/support" className="guardian-support-btn">Support us</a>
          </div>
        </div>
      </div>

      {/* ── Row 2: Masthead row ───────────────────────────────────────────── */}
      <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,.15)', minHeight: 60 }}>
        <div className="w-full max-w-[1300px] mx-auto px-4 flex items-center justify-between" style={{ minHeight: 60 }}>
          <Link href="/" className="guardian-masthead">
            The Guardian
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/search" aria-label="Search" style={{ color: 'rgba(255,255,255,.85)' }}>
              <Search className="w-5 h-5" />
            </Link>
            <LoginButton webauth={webauth} />
          </div>
        </div>
      </div>

      {/* ── Date line ─────────────────────────────────────────────────────── */}
      <div className="guardian-date-line hidden sm:block">
        {dateLabel}
      </div>

    </header>
  );
}
