import { NextRequest } from 'next/server';
import { getGraphAccessToken } from '@/lib/graph';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  const name = req.nextUrl.searchParams.get('name') ?? 'User';

  if (!email) {
    return new Response('Missing email', { status: 400 });
  }

  try {
    const token = await getGraphAccessToken();

    const photoRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(email)}/photo/$value`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    if (!photoRes.ok) {
      throw new Error(`No photo for ${email}`);
    }

    const contentType = photoRes.headers.get('content-type') || 'image/jpeg';
    const bytes = await photoRes.arrayBuffer();

    return new Response(bytes, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=F5F3EE&color=111111&size=128&bold=true`;

    return Response.redirect(fallbackUrl);
  }
}