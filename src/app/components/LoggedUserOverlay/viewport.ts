export type EditorialViewport = 'responsive' | 'tablet' | 'phone';
export type ViewportOrientation = 'portrait' | 'landscape';

export const VIEWPORT_STORAGE_KEY = 'neon-editorial-viewport';
export const VIEWPORT_QUERY_KEY = 'neon.viewport';
export const ORIENTATION_STORAGE_KEY = 'neon-editorial-orientation';
export const ORIENTATION_QUERY_KEY = 'neon.orientation';
const VIEWPORT_DIMENSIONS = { tablet: { width: 768, height: 1024 }, phone: { width: 390, height: 844 } } as const;

export function parseEditorialViewport(value: string | null): EditorialViewport | undefined {
  return value === 'responsive' || value === 'tablet' || value === 'phone' ? value : undefined;
}

export function parseViewportOrientation(value: string | null): ViewportOrientation | undefined {
  return value === 'portrait' || value === 'landscape' ? value : undefined;
}

export function viewportDimensions(viewport: Exclude<EditorialViewport, 'responsive'>, orientation: ViewportOrientation) {
  const { width, height } = VIEWPORT_DIMENSIONS[viewport];
  return orientation === 'portrait' ? { width, height } : { width: height, height: width };
}
