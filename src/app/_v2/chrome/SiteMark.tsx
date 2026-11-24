'use client';

import { useCallback, useRef, useState } from 'react';
import { initials } from './initials';

type Props = {
  logoUrl?: string;
  label: string;
  showInitials: boolean;
};

export default function SiteMark({ logoUrl, label, showInitials }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const errorReported = useRef(false);
  const src = logoUrl?.trim().replace(/^\/neon\/api\/site\/resources(?=\/|[?#]|$)/, '/resources');
  const handleError = useCallback(() => {
    if (!errorReported.current) {
      console.warn('[v2 header] Site logo could not be loaded.');
      errorReported.current = true;
    }
    setStatus('failed');
  }, []);
  const checkCachedImage = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete) {
      if (image.naturalWidth > 0) setStatus('loaded');
      else handleError();
    }
  }, [handleError]);

  return (
    <span className="v2-header__mark" aria-hidden="true">
      {(!src || status !== 'loaded') && (
        <span className="v2-header__disc">{showInitials ? initials(label) : ''}</span>
      )}
      {src && status !== 'failed' && (
        <img
          ref={checkCachedImage}
          className="v2-header__logo"
          src={src}
          alt=""
          style={{ opacity: status === 'loaded' ? 1 : 0 }}
          onLoad={() => setStatus('loaded')}
          onError={handleError}
        />
      )}
    </span>
  );
}
