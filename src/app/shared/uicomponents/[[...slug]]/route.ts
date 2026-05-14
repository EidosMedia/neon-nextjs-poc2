import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const filePath = slug ? slug.join('/') : '';
  const baseUrl = process.env.BASE_NEON_FO_URL;

  if (!baseUrl) {
    return new NextResponse('BASE_NEON_FO_URL is not configured', { status: 500 });
  }

  const upstreamUrl = `${baseUrl}/shared/uicomponents/${filePath}`;

  const upstream = await fetch(upstreamUrl, {
    headers: {
      'User-Agent': req.headers.get('user-agent') ?? 'neon-nextjs-poc',
    },
    cache: 'no-store',
  });

  if (!upstream.ok) {
    return new NextResponse(`Upstream error: ${upstream.statusText}`, {
      status: upstream.status,
    });
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
}
