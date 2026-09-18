import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CRMProvider } from '@/lib/store';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Quniverze — Sales CRM & Outreach Command Center',
  description: 'High-contrast, editorial sales cockpit for web, design, and software services.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen bg-[#F7F7F5] text-[#111111]`}>
        <CRMProvider>
          {children}
        </CRMProvider>
      </body>
    </html>
  );
}
