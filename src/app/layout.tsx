
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

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

  useEffect(() => {
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);
    
    async function checkSession() {
        try {
          const response = await fetch('/api/auth/session');
          if (response.ok) {
            const data = await response.json();
            const sessionUser = data.session || null;
            setUser(sessionUser);

            // Se o usuário está em uma rota pública mas tem uma sessão, redirecione para a home.
            if (isPublicRoute && sessionUser?.email) {
              router.push('/');
              return; // Para a execução para evitar que o setLoading(false) seja chamado prematuramente.
            }
            // Se o usuário está em uma rota protegida e não tem sessão, redirecione para o login.
            if (!isPublicRoute && !sessionUser?.email) {
              router.push('/login');
              return;
            }
            
          } else {
             setUser(null);
             if (!isPublicRoute) {
                router.push('/login');
                return;
             }
          }
        } catch (error) {
          console.error("Failed to fetch session:", error);
          setUser(null);
          if(!isPublicRoute) {
            router.push('/login');
            return;
          }
        } finally {
            // Apenas para de carregar quando todas as verificações e redirecionamentos potenciais terminarem.
            setLoading(false);
        }
    }
    
    checkSession();
  }, [pathname, router]);

  const isPublicPage = ['/login', '/register'].includes(pathname);

  // Renderiza um loader de tela cheia enquanto a sessão está sendo verificada.
  if (loading) {
     return (
       <html lang="en" suppressHydrationWarning>
        <body className="font-body antialiased">
          <div className="flex items-center justify-center min-h-screen bg-background">
            {/* Você pode colocar um loader/spinner mais sofisticado aqui */}
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
          {!isPublicPage && <Header user={user} />}
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
