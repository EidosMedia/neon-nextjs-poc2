'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { DAILY_METERED_ALLOWANCE, readerAccess, type PaywallLevel } from '../lib/paywall';
import { useMeteredAccess } from './useMeteredAccess';

type Props = {
  level: PaywallLevel;
  registered: boolean;
  siteName: string;
  url: string;
  preview?: boolean;
  children: ReactNode;
};

/** Demo presentation only: children still travel in the RSC payload; this is not access control. */
export default function ReaderGate({ level, registered, siteName, url, preview = false, children }: Props) {
  const previewTier = useSelector((state: RootState) => state.loggedUser.previewReaderTier);
  const inspectItems = useSelector((state: RootState) => state.loggedUser.inspectItems);
  const access = preview && inspectItems ? 'open' : readerAccess(level, registered, preview ? previewTier : undefined);
  const metered = useMeteredAccess(access === 'metered', siteName, url, preview);
  if (access === 'open') return children;
  if (access === 'subscription') {
    return <><p className="v2-access-notice">Premium content included with your subscription (demo).</p>{children}</>;
  }
  if (access === 'metered') {
    if (metered.failed) {
      return <div className="v2-access-notice" role="alert">Your daily allowance could not be saved. Enable browser storage and reload to read this article.</div>;
    }
    if (!metered.result) return <p className="v2-access-notice" role="status" aria-busy="true">Checking your daily allowance...</p>;
    const counter = (
      <p className="v2-access-notice" role="status">
        {preview && 'Preview simulation: '}
        {metered.result.remaining} of {DAILY_METERED_ALLOWANCE} metered articles left for today. Resets at 00:00 UTC.
      </p>
    );
    if (metered.result.allowed) return <>{counter}{children}</>;
    return (
      <>
        {counter}
        <div className="v2-paywall v2-paywall--gate">
          <div className="v2-paywall__card">
            <h2 className="v2-paywall__title">Daily allowance reached</h2>
            <p>You can reread today&apos;s articles or return after 00:00 UTC for 10 more.</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="v2-paywall v2-paywall--gate">
        <div className="v2-paywall__card">
          <h2 className="v2-paywall__title">{access === 'upgrade' ? 'Premium subscription required' : 'Log in to continue reading'}</h2>
          <p>{access === 'upgrade' ? 'This content is available to subscribers.' : 'This content is available to registered readers.'}</p>
          {access === 'login' && <Link className="v2-paywall__button" href="/login">Log in</Link>}
        </div>
      </div>
    </>
  );
}
