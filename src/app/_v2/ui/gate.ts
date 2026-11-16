/** The v2 style guide shows fixtures: editors always, anyone outside production, readers in production never. */
export function canShowStyleGuide(hasEditorialCookie: boolean, nodeEnv: string | undefined): boolean {
  return hasEditorialCookie || nodeEnv !== 'production';
}
