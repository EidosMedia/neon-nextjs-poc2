/** Absolute URL for sharing: hrefs that are already absolute are kept. */
export function absoluteUrl(href: string, origin: string): string {
  try {
    return new URL(href, origin).toString();
  } catch {
    return origin;
  }
}
