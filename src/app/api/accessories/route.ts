import { NextRequest, NextResponse } from 'next/server';
import pino from 'pino';
import { getAccessoryDefinitions, THEME_NAME_PATTERN } from '@/lib/accessories/definitions';

const logger = pino({ name: 'neon-fo:accessories-api' });

let warnedAboutMissingSecret = false;

// Every rejection is a 404 for the caller; the log says why, without printing any secret.
function notFound(reason: string, body: string, detail?: Record<string, unknown>): NextResponse {
  logger.warn({ event: 'accessories-not-found', reason, ...detail }, `[accessories-api] 404: ${reason}`);
  return NextResponse.json({ error: body }, { status: 404 });
}

export async function GET(request: NextRequest) {
  const headerName = process.env.INVALIDATE_NEXTJS_HEADER_NAME ?? 'invalidate-secret';
  const expectedSecret = process.env.INVALIDATE_NEXTJS_HEADER_VALUE;
  const suppliedSecret = request.headers.get(headerName);

  if (!expectedSecret) {
    if (!warnedAboutMissingSecret) {
      warnedAboutMissingSecret = true;
      logger.error('INVALIDATE_NEXTJS_HEADER_VALUE is not set: /api/accessories and /api/cache reject every call');
    }
    return notFound('INVALIDATE_NEXTJS_HEADER_VALUE is not configured', 'Not Found - Invalid Call');
  }
  if (!suppliedSecret || suppliedSecret !== expectedSecret) {
    return notFound(`missing or incorrect "${headerName}" header`, 'Not Found - Invalid Call');
  }

  const theme = request.nextUrl.searchParams.get('theme');
  if (!theme) {
    return NextResponse.json({ error: 'A theme is required.' }, { status: 400 });
  }

  const definitions = THEME_NAME_PATTERN.test(theme) ? getAccessoryDefinitions(theme) : undefined;
  if (!definitions) {
    return notFound('no accessories.json is registered for the theme', 'Theme definitions were not found.', {
      theme: theme.slice(0, 64),
    });
  }

  // Return the complete theme document; the Neon Sites service filters by editor context.
  // A known theme with no matching page/zone/link definition remains a successful empty result there.
  return NextResponse.json(definitions);
}