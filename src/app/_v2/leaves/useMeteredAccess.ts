'use client';
import { useEffect, useState } from 'react';
import { meteredStorageKey, readMeteredDay, recordMeteredVisit, type MeteredVisit } from '../lib/paywall';

type State = { identity: string; result?: MeteredVisit; failed?: boolean };
const METER_UPDATED = 'neon:meter-updated';

export function useMeteredAccess(enabled: boolean, siteName: string, url: string, preview = false) {
  const identity = JSON.stringify([siteName, url, enabled, preview]);
  const [state, setState] = useState<State>({ identity });

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let resetTimer: ReturnType<typeof setTimeout>;
    const key = meteredStorageKey(siteName, preview);
    const update = async () => {
      const readAndRecord = () => {
        if (!active) return;
        const now = new Date();
        const result = recordMeteredVisit(readMeteredDay(localStorage.getItem(key), now), url || window.location.pathname, now);
        const serialized = JSON.stringify(result.record);
        if (localStorage.getItem(key) !== serialized) {
          localStorage.setItem(key, serialized);
          window.dispatchEvent(new Event(METER_UPDATED));
        }
        setState({ identity, result });
        clearTimeout(resetTimer);
        const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
        resetTimer = setTimeout(() => void update(), midnight - now.getTime() + 50);
      };
      try {
        if (navigator.locks) await navigator.locks.request(key, readAndRecord);
        else readAndRecord();
      } catch (error) {
        console.warn('Metered article history could not be saved', error);
        if (active) setState({ identity, failed: true });
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) void update();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void update();
    };
    const onUpdated = () => void update();
    void update();
    window.addEventListener('storage', onStorage);
    window.addEventListener(METER_UPDATED, onUpdated);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      clearTimeout(resetTimer);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(METER_UPDATED, onUpdated);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, identity, siteName, url, preview]);

  return state.identity === identity ? state : { identity };
}
