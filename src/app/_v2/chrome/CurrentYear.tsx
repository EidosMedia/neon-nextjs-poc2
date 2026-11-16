'use client';

export default function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
