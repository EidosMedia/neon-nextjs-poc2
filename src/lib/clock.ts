import { cacheLife } from 'next/cache';

export async function getCurrentYear(): Promise<number> {
  'use cache';
  cacheLife('max');
  return new Date().getFullYear();
}

export async function getCachedTimestamp(): Promise<number> {
  'use cache';
  cacheLife('hours');
  return Date.now();
}
