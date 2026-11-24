'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import useWebauth from '@/hooks/useWebauth';
import { logoutWebUser } from '@/lib/auth/logout';
import type { RootState } from '@/lib/store';

export default function HeaderActions({ authenticated, preview, drawer = false }: {
  authenticated: boolean;
  preview: boolean;
  drawer?: boolean;
}) {
  const { data } = useWebauth();
  const [busy, setBusy] = useState(false);
  const tier = useSelector((state: RootState) => state.loggedUser.previewReaderTier);
  const editorialBarVisible = useSelector((state: RootState) => state.loggedUser.editorialBarVisible);
  const simulatedTier = preview && editorialBarVisible ? tier : undefined;
  const signedIn = simulatedTier ? simulatedTier !== 'FREE' : authenticated;
  const name = simulatedTier === 'REGISTERED' ? 'Registered reader'
    : simulatedTier === 'PREMIUM' ? 'Premium subscriber' : data.userName;

  const logout = async () => {
    setBusy(true);
    await logoutWebUser();
  };

  return (
    <>
      {simulatedTier !== 'PREMIUM' && (
        <Link href="/login" className={drawer ? 'v2-drawer__subscribe' : 'v2-header__subscribe'}>
          Subscribe
        </Link>
      )}
      {signedIn ? (
        <span className="v2-header__account">
          <span className="v2-header__username">{name}</span>
          <button type="button" className="v2-header__login" onClick={logout}
            disabled={busy || Boolean(simulatedTier)}
            title={simulatedTier ? 'Unavailable in reader simulation' : undefined}>
            Logout
          </button>
        </span>
      ) : (
        <Link href="/login" className="v2-header__login">Login</Link>
      )}
    </>
  );
}
