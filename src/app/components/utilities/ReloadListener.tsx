'use client';

import { useEffect } from 'react';

export function ReloadListener() {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'reload') {
      window.location.reload();
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    // Cleanup on unmount to remove event listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return null;
}
