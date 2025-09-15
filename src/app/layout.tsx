
'use client';
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { useEffect, useState } from 'react';
import type { UserSession } from '@/types';
import Header from '@/components/header';
import { usePathname, useRouter } from 'next/navigation';

// export const metadata: Metadata = {
//   title: 'ClosetPic',
//   description: 'Upload, categorize, and search your images.',
// };

// A lógica de proteção de rotas foi movida para o middleware.ts

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Busca os dados da sessão para exibir no Header, mas não lida mais com redirecionamentos.
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setUser(data.session || null);
        } else {
           setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [pathname]); // Re-fetches a sessão quando a rota muda


  // O middleware agora lida com o redirecionamento de usuários logados/deslogados.
  // Este layout não precisa mais dessa lógica.

  // Renderiza um loader enquanto a sessão está sendo verificada
  const isPublicPage = ['/login', '/register'].includes(pathname);
  if (loading && !isPublicPage) {
     return (
       <html lang="en" suppressHydrationWarning>
        <body>
          <div className="flex items-center justify-center min-h-screen">
            {/* Um loader simples pode ser exibido aqui */}
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>ClosetPic</title>
        <meta name="description" content="Upload, categorize, and search your images." />
        <meta name="application-name" content="ClosetPic" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ClosetPic" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#8B5CF6" />

        <link rel="manifest" href="/manifest.webmanifest" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />

        <link rel="icon" href="/LOGO.png" type="image/png" />
        <link rel="apple-touch-icon" href="/LOGO.png" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* O Header só será exibido se não for uma página pública, para não aparecer na tela de login */}
          {!isPublicPage && <Header user={user} />}
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
