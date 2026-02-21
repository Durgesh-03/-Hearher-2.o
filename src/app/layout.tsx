import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'HearHer — AI-Powered Workplace Safety',
    description:
        'Smart, AI-powered platform for workplace safety & harassment prevention. File anonymous complaints, trigger panic alerts, and ensure POSH Act compliance.',
    keywords: ['POSH', 'workplace safety', 'harassment prevention', 'anonymous complaints', 'AI'],
    manifest: '/manifest.json',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#0a0e1a',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <head>
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body className="antialiased">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
