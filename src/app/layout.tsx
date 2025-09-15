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

const protectedRoutes = ['/'];
const publicRoutes = ['/login', '/register'];


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const pathname = usePathname();
  const router = useRouter();


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Fetch user session data
    fetch('/api/auth/session').then(res => res.json()).then(data => {
      const sessionUser = data.session || null;
      setUser(sessionUser);
      setLoadingSession(false);

      const isProtectedRoute = protectedRoutes.includes(pathname);
      const isPublicRoute = publicRoutes.includes(pathname);

      if (isProtectedRoute && !sessionUser) {
        router.push('/login');
      }

      if (isPublicRoute && sessionUser) {
        router.push('/');
      }

    });


    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [pathname, router]);

  if (loadingSession) {
    // Você pode renderizar um skeleton/spinner de página inteira aqui
    return (
       <html lang="en" suppressHydrationWarning>
        <body>
          <div className="flex items-center justify-center min-h-screen">
            {/* Opcional: adicione um spinner de carregamento aqui */}
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
          <Header user={user} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
