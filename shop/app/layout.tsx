/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next';
import './team262.css';
import './shop.css';

export const metadata: Metadata = {
  title: 'Team262 Shop — Alles voor de stalling van je auto',
  description:
    'Autohoezen, acculaders, bandenwiegen, ontvochtigers en meer: alles om je auto in topconditie te stallen, geselecteerd door Team262.',
  icons: {
    icon: [
      { url: '/img/logo-black.svg', type: 'image/svg+xml' },
      { url: '/img/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/img/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/img/apple-touch-icon.png',
  },
};

export const viewport = { themeColor: '#0c0e11' };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
