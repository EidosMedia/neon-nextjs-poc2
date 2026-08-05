const VERSION_SUFFIX_PATTERN = /-n?\d{10,20}$/;

const countDashes = (value: string): number => (value.match(/-/g) || []).length;

/**
 * Removes trailing content version suffix from a pathname content-id segment only when
 * the segment has exactly 4 dashes and ends with -n?digits.
 *
 * Example:
 * /.../0298-aaa-bbb-1000-n365697720211/index.html -> /.../0298-aaa-bbb-1000/index.html
 */
export const normalizeLiveSwitchPathname = (pathname: string): string => {
  if (!pathname.endsWith('/index.html')) {
    return pathname;
  }

  const segments = pathname.split('/');
  const indexSegment = segments.findIndex(segment => segment === 'index.html');

  if (indexSegment <= 0) {
    return pathname;
  }

  const idSegment = segments[indexSegment - 1];
  if (countDashes(idSegment) !== 4 || !VERSION_SUFFIX_PATTERN.test(idSegment)) {
    return pathname;
  }

  segments[indexSegment - 1] = idSegment.replace(VERSION_SUFFIX_PATTERN, '');
  return segments.join('/');
};
