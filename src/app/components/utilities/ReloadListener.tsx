'use client';

import { isNeonAppPreview } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { useEffect } from 'react';

export function ReloadListener() {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'reload') {
      window.location.reload();
    }
    if (event.data.type === 'showSelectedItem' &&
      event.data.payload &&
      (typeof event.data.payload) === 'string' &&
      event.data.payload.length === 35
    ) {
      // quite sure that is a family id string
      window.location.href = '#' + event.data.payload;
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
