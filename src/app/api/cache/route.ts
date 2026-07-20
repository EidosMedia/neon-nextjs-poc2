import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import pino from 'pino';

const logger = pino({ name: 'neon-fo:cache-api' });

interface CachePayload {
  siteName: string;
  evict?: { ids?: string[]; paths?: string[] };
  revalidate?: { ids?: string[]; paths?: string[] };
}

export async function POST(request: NextRequest) {
  const headerName = process.env.INVALIDATE_NEXTJS_HEADER_NAME ?? 'invalidate-secret';
  const secret = request.headers.get(headerName);
  if (!secret || secret !== process.env.INVALIDATE_NEXTJS_HEADER_VALUE) {
    return NextResponse.json({ error: 'Not Found - Invalid Call'}, { status: 404 });
  }

  let body: CachePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const sites = await connection.getSitesList();
    const knownSiteNames = sites.map((s) => s.root.name);
    if (!body.siteName || !knownSiteNames.includes(body.siteName)) {
      return NextResponse.json({ error: 'Unknown site name.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to validate site name.' }, { status: 500 });
  }

  try {
    const summary = { evictedTags: 0, evictedPaths: 0, revalidatedTags: 0, revalidatedPaths: 0 };

    logger.info(
      {
        event: 'cache-invalidation-received',
        siteName: body.siteName,
        evictIds: body.evict?.ids ?? [],
        evictPaths: body.evict?.paths ?? [],
        revalidateIds: body.revalidate?.ids ?? [],
        revalidatePaths: body.revalidate?.paths ?? [],
      },
      `[cache-api] invalidation for "${body.siteName}" — evict ids: [${(body.evict?.ids ?? []).join(', ')}] paths: [${(body.evict?.paths ?? []).join(', ')}]`,
    );
    if (body.evict) {
      if (body.evict.ids) {
        body.evict.ids.forEach((id) => revalidateTag(`neon:node:${id}`, 'default'));
        summary.evictedTags = body.evict.ids.length;
      }
      if (body.evict.paths) {
        body.evict.paths.forEach((path) => revalidatePath(path));
        summary.evictedPaths = body.evict.paths.length;
      }
    }

    if (body.revalidate) {
      if (body.revalidate.ids) {
        body.revalidate.ids.forEach((id) => revalidateTag(`neon:node:${id}`, 'default'));
        summary.revalidatedTags = body.revalidate.ids.length;
      }
      if (body.revalidate.paths) {
        body.revalidate.paths.forEach((path) => revalidatePath(path));
        summary.revalidatedPaths = body.revalidate.paths.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cache instructions processed successfully.',
      summary,
    }, { status: 200 });

  } catch {
    return NextResponse.json({ error: 'Processing error.' }, { status: 500 });
  }
}
