import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RoleProvider } from '@/components/RoleContext';
import { MainLayout } from '@/components/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CortexFlow',
  description: 'AI System execution interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <RoleProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </RoleProvider>
      </body>
    </html>
  );
}
