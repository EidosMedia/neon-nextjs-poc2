import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const filePath = slug ? slug.join('/') : '';

  const upstream = await connection.fetchUiComponent(filePath);

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
