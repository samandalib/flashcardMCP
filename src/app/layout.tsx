import type { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from '@/components/LocaleContext';
import { GlobalHeader } from '@/components/GlobalHeader';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Flashcard Research Synthesizer',
  description: 'AI-powered flashcard creation and research synthesis tool',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Flashcard App',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Flashcard Research Synthesizer',
    title: 'Flashcard Research Synthesizer',
    description: 'AI-powered flashcard creation and research synthesis tool',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LocaleProvider>
          <div className="min-h-screen flex flex-col">
            <GlobalHeader />
            <main className="flex-1">
              {children}
            </main>
            <PWAInstallPrompt />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}