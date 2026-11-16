'use client';
import { useId, useState } from 'react';
import useWebauth from '@/hooks/useWebauth';

/** v2 web-user login: same endpoint and webauth flow as the legacy form, v2 markup. */
export default function LoginForm() {
  const { setUserName } = useWebauth();
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const id = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFailed(false);
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('email') as string;
    const password = formData.get('password') as string;
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });
      if (res.ok) {
        const webauthResp = await res.json();
        setUserName(webauthResp.name);
        window.location.href = '/';
        return;
      }
      setFailed(true);
    } catch {
      setFailed(true);
    }
    setSubmitting(false);
  };

  return (
    <form className="v2-login" onSubmit={handleSubmit} aria-labelledby={`${id}-title`}>
      <h1 id={`${id}-title`} className="v2-special__title">Log in</h1>
      {/* The live region stays mounted so the error is announced when it appears. */}
      <div role="alert" aria-live="assertive">
        {failed && <p className="v2-field__error">Unable to login</p>}
      </div>
      <p className="v2-special__legal">
        Enter your credentials to access all products. By proceeding, you agree to our terms and conditions.
      </p>
      <p className="v2-special__legal">For information about how we use your data, see our privacy policy.</p>
      <div className="v2-field">
        <label className="v2-field__label" htmlFor={`${id}-email`}>Username</label>
        <input
          id={`${id}-email`} name="email" type="text" className="v2-field__control"
          required autoComplete="email" aria-invalid={failed || undefined}
        />
      </div>
      <div className="v2-field">
        <label className="v2-field__label" htmlFor={`${id}-password`}>Password</label>
        <input
          id={`${id}-password`} name="password" type="password" className="v2-field__control"
          required autoComplete="current-password" aria-invalid={failed || undefined}
        />
      </div>
      <button type="submit" className="v2-btn" disabled={submitting}>Login</button>
    </form>
  );
}
