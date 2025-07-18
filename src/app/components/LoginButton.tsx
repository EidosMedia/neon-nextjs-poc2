'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './baseComponents/button';
import { CircleUserRound, LogOut } from 'lucide-react';
import useWebauth from '@/hooks/useWebauth';

const LoginButton: React.FC<{ webauth?: string }> = ({ webauth }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [currentWebauth, setCurrentWebauth] = useState(webauth);
  const { data: webauthData } = useWebauth();

  // Refresh the button if webauth changes
  useEffect(() => {
    setCurrentWebauth(webauth);
    setShowMenu(false);
  }, [webauth]);

  const handleLogout = async () => {
    // Call a dedicated logout API route to clear the cookie server-side
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
    setShowMenu(false);
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex gap-2">
        <Button variant="default">Subscribe</Button>
        {currentWebauth ? (
          <>
            <div className="flex flex-col relative">
              <Button variant="secondary" className="flex items-center gap-2" onClick={() => setShowMenu(v => !v)}>
                {webauthData.userName} <CircleUserRound />
              </Button>
              {showMenu && (
                <div className="relative">
                  <div className="bg-white z-20 flex absolute mt-1 left-0 flex-row items-center justify-start rounded shadow-lg border-gray-500 border-1 ml-0 w-fit">
                    <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        Logout <LogOut />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link href="/login" className="flex items-center gap-2">
            <Button variant="secondary" className="flex items-center gap-2">
              Login <CircleUserRound />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default LoginButton;
