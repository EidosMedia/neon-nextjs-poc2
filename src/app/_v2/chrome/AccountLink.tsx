'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useWebauth from '@/hooks/useWebauth';
import { logoutWebUser } from '@/lib/auth/logout';

/** Login link, or the signed-in user's name with a logout button. Same webauth flow as the legacy LoginButton. */
export default function AccountLink({ webauth }: { webauth?: string }) {
  const { data } = useWebauth();
  const [currentWebauth, setCurrentWebauth] = useState(webauth);
  const [busy, setBusy] = useState(false);

  // Follow the server-provided cookie value when it changes.
  useEffect(() => {
    setCurrentWebauth(webauth);
  }, [webauth]);

  if (!currentWebauth) {
    return (
      <Link href="/login" className="v2-header__login">
        Login
      </Link>
    );
  }

  const logout = async () => {
    setBusy(true);
    await logoutWebUser();
  };

  return (
    <span className="v2-header__account">
      <span className="v2-header__username">{data.userName}</span>
      <button type="button" className="v2-header__login" onClick={logout} disabled={busy}>
        Logout
      </button>
    </span>
  );
}
