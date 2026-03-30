export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const FINARO_GREEN = '#2F7A65';

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function brandedFallbackAvatar(name: string): Response {
  const initials = escapeXml(getInitials(name));

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="${initials}">
      <rect width="128" height="128" rx="64" fill="${FINARO_GREEN}" />
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#FFFFFF"
        font-family="Arial, Helvetica, sans-serif"
        font-size="44"
        font-weight="700"
      >
        ${initials}
      </text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

async function findLocalAvatar(email: string): Promise<Response | null> {
  const avatarDir = path.join(process.cwd(), 'public', 'avatars');
  const emailBase = email.split('@')[0]?.trim().toLowerCase();

  if (!emailBase) return null;

  console.log('[avatar] email:', email);
  console.log('[avatar] emailBase:', emailBase);
  console.log('[avatar] avatarDir:', avatarDir);

  const extensions = ['.png', '.jpg', '.jpeg', '.webp'];

  for (const ext of extensions) {
    const filePath = path.join(avatarDir, `${emailBase}${ext}`);
    console.log('[avatar] checking:', filePath);

    try {
      const file = await fs.readFile(filePath);

      const contentType =
        ext === '.png'
          ? 'image/png'
          : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : 'image/webp';

      console.log('[avatar] found:', filePath);

      return new Response(file, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch {
      // try next extension
    }
  }

  console.log('[avatar] fallback for:', email);
  return null;
}

export async function GET(req: NextRequest) {
  const rawEmail = req.nextUrl.searchParams.get('email');
  const name = (req.nextUrl.searchParams.get('name') || 'User').trim() || 'User';

  if (!rawEmail) {
    return new NextResponse('Missing email', { status: 400 });
  }

  const email = rawEmail.trim().toLowerCase();

  const localAvatar = await findLocalAvatar(email);
  if (localAvatar) {
    return localAvatar;
  }

  return brandedFallbackAvatar(name);
}