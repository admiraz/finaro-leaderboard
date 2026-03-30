import type { Metadata, Viewport } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Finaro Leaderboard',
  description: 'Live performance tracking dashboard',
  icons: {
    icon: [
      {
        url: '/images/favicon-light.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/images/favicon-dark.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: [
      {
        url: '/images/favicon-light.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/images/favicon-dark.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={spaceGrotesk.variable}>
      <body className="h-full bg-fin-bg text-fin-text font-sans">
        {children}
      </body>
    </html>
  );
}
