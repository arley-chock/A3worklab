"use client"

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

// Metadata will be exported from a separate file or handled differently for client components
// export const metadata: Metadata = {
//   title: 'WorkLab - Sistema de Gestão de Recursos',
//   description: 'Sistema de gestão de recursos e reservas',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {isAuthPage ? (
            <div className="flex h-screen items-center justify-center bg-gray-100">
              {children}
            </div>
          ) : (
            <div className="flex h-screen bg-gray-100">
              <div className="w-64 flex-shrink-0">
                <Sidebar />
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                  {children}
                </main>
              </div>
            </div>
          )}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
} 