import type { Metadata } from 'next';
import './globals.css';
import VersionLogger from '@/components/VersionLogger';

export const metadata: Metadata = {
  title: 'LinguaVoice',
  description: 'Learn English via voice + AI — for Slovak and Czech speakers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <VersionLogger />
        {children}
      </body>
    </html>
  );
}
