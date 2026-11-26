import { NextRequest, NextResponse } from 'next/server';
import { handleServicesError } from '@/services/utils';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const filePath = slug ? slug.join('/') : '';

  try {
    const upstream = await connection.fetchUiComponent(filePath);
    if (!upstream.ok) {
      return new NextResponse(`Upstream error: ${upstream.statusText}`, { status: upstream.status });
    }

    const body = await upstream.arrayBuffer();
    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('[uicomponents] upstream fetch failed:', error);
    return handleServicesError(error);
  }
}
