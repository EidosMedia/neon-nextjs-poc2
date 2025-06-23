'use client';
import React, { useState } from 'react';
import useWebauth from '@/hooks/useWebauth';
import { CircleX } from 'lucide-react';
import { Button } from './baseComponents/button';

const LoginForm: React.FC = () => {
  const { data: webauthData, setUserName } = useWebauth();
  const [loginError, setLoginError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(false);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('email') as string;
    const password = formData.get('password') as string;
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });
    if (res.ok) {
      setLoginError(false);
      const webauthResp = await res.json();
      setUserName(webauthResp.name);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } else {
      setLoginError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center">Log in</h2>
        {loginError && (
          <div className="bg-red-600 text-white text-center py-2 rounded flex items-center justify-center gap-2 mb-4">
            <CircleX /> <span>Unable to login</span>
          </div>
        )}
        <p className="mb-4 text-gray-600">
          Enter your credential to access all The Globe products. By proceeding, you agree to out terms and conditions.
        </p>
        <p className="mb-4 text-gray-600">For information about how we use your data, see our privacy policy.</p>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="text"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            required
            autoComplete="email"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            required
            autoComplete="current-password"
          />
        </div>
        <Button variant="default" className="flex items-center gap-2">
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
