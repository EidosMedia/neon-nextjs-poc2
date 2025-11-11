'use client';

import { isNeonAppPreview } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { AlignCenter } from 'lucide-react';
import { useEffect } from 'react';

export function ReloadListener() {

  const handleLoad = (event: Event) => {
    console.log('window Loaded ' + window.location);
    
    if (window.location.hash && (typeof window.location.hash === 'string') &&
      window.location.hash.length===36) {
        const id = window.location.hash.substring(1);
        // quite sure that is a family id string
        window.location.hash = '#' + id;
        window.document.getElementById(id)?.scrollIntoView({ block: 'center' });
        console.log('scrolling after load to  ' + id);
    }
  };

  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'reload') {
      if (event.data.payload && (typeof event.data.payload) === 'string' && event.data.payload.length===35) {
        window.location.hash = '#' + event.data.payload.replaceAll('-', '_');
      }
      window.history.scrollRestoration = 'manual';
      window.location.reload();
    }

    if (event.data.type === 'showSelectedItem' &&
      event.data.payload &&
      (typeof event.data.payload) === 'string' &&
      event.data.payload.length === 35
    ) {
      // quite sure that is a family id string
      window.location.hash = '#' + event.data.payload.replaceAll('-', '_');
      window.document.getElementById(event.data.payload.replaceAll('-', '_'))?.scrollIntoView({ block: 'center' });
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    window.addEventListener('load', handleLoad);

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
