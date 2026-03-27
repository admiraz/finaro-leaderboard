import { NextRequest, NextResponse } from 'next/server';
import { getGraphAccessToken } from '@/lib/graph';

// Fallback avatar via ui-avatars.com — proxied as bytes so browsers always
// receive an image response regardless of redirect handling.
async function fallbackAvatar(name: string): Promise<Response> {
  const url = new URL('https://ui-avatars.com/api/');
  url.searchParams.set('name', name);
  url.searchParams.set('background', 'E8E8E4');
  url.searchParams.set('color', '111111');
  url.searchParams.set('size', '128');
  url.searchParams.set('bold', 'true');
  url.searchParams.set('format', 'png');

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    const bytes = await res.arrayBuffer();
    return new Response(bytes, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    // Last-resort: 1×1 transparent PNG
    const transparent = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    return new Response(transparent, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=60' },
    });
  }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  const name = req.nextUrl.searchParams.get('name') ?? 'User';

  if (!email) {
    return new NextResponse('Missing email', { status: 400 });
  }

  // Try Microsoft Graph profile photo first
  try {
    const token = await getGraphAccessToken();
    const photoRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(email)}/photo/$value`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );

    if (!photoRes.ok) throw new Error(`Graph returned ${photoRes.status}`);

    const contentType = photoRes.headers.get('content-type') || 'image/jpeg';
    const bytes = await photoRes.arrayBuffer();

    return new Response(bytes, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    // Graph photo unavailable — return the proxied fallback
    return fallbackAvatar(name);
  }
}
