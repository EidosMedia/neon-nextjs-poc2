'use client';
import { useState } from 'react';
import Link from 'next/link';
import useWebauth from '@/hooks/useWebauth';

/** Login link, or the signed-in user's name with a logout button. Uses the same `webauth` flow as the legacy LoginButton. */
export default function AccountLink({ webauth }: { webauth?: string }) {
  const { data } = useWebauth();
  const [busy, setBusy] = useState(false);

  if (!webauth) {
    return (
      <Link href="/login" className="v2-header__login">
        Login
      </Link>
    );
  }

  const logout = async () => {
    setBusy(true);
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
    window.location.reload();
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
