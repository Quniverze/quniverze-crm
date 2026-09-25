import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CRMProvider } from '@/lib/store';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Quniverze. — Operating System',
  description: 'Products. Services. Real impact. Software for businesses that move forward.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen bg-[#F4F6F9] text-[#12151C]`}>
        <CRMProvider>
          {children}
        </CRMProvider>
      </body>
    </html>
  );
}
