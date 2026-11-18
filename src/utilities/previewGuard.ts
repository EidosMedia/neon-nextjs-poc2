/**
 * Embedded Neon preview guard. Inside the Neon app preview frame (`isNeonAppPreview()`) the page must not
 * navigate, so a misclick cannot take the editor's preview elsewhere. One capture listener on `window`
 * catches every link click and form submit, including elements rendered after mount (streamed sections,
 * client menus, live blog posts), in legacy and v2 themes alike. Buttons that only open or close UI keep
 * working.
 */

/** Whether following a link with this `href` would leave the current page. */
export function leavesPage(href: string | null | undefined): boolean {
  const value = (href ?? '').trim();
  if (!value || value.startsWith('#')) return false;
  return !/^javascript:/i.test(value);
}

/** Installs the guard; returns the cleanup. */
export function installPreviewGuard(target: Window = window): () => void {
  const onClick = (event: Event) => {
    const link = (event.target as Element | null)?.closest?.('a[href]');
    if (!link || !leavesPage(link.getAttribute('href'))) return;
    event.preventDefault();
    // Stop before React's root listener, so client-side routers (next/link) do not navigate either.
    event.stopPropagation();
  };
  const onSubmit = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  target.addEventListener('click', onClick, true);
  target.addEventListener('auxclick', onClick, true);
  target.addEventListener('submit', onSubmit, true);
  return () => {
    target.removeEventListener('click', onClick, true);
    target.removeEventListener('auxclick', onClick, true);
    target.removeEventListener('submit', onSubmit, true);
  };
}
