import { getCurrentYear } from '@/lib/clock';

export default async function CurrentYear() {
  return <span suppressHydrationWarning>{await getCurrentYear()}</span>;
}
