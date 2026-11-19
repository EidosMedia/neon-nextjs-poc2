/** Up to two uppercase initials of a label; '' for empty or missing text. */
export function initials(text: string | undefined): string {
  return (text ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('');
}
