'use client';

import { isNeonAppPreview } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { useEffect } from 'react';

export function ReloadListener() {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'reload') {
      window.location.reload();
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    if (isNeonAppPreview()) {
      document.querySelectorAll('a').forEach(link => {
        // disable links in the preview mode
        link.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
        });
      });
    }

    // Cleanup on unmount to remove event listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return null;
}
