import type { ComponentProps } from 'react';
import NewsletterWebpage from '../../_pages/NewsletterWebpage';
import LegacyIsland from '../ui/LegacyIsland';

/** The newsletter page is still legacy; the island keeps the guarded legacy globals working inside the v2 root. */
export default function NewsletterLegacy(props: ComponentProps<typeof NewsletterWebpage>) {
  return (
    <LegacyIsland>
      <NewsletterWebpage {...props} />
    </LegacyIsland>
  );
}
