
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
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Effect to check session status on initial load and on navigation
  useEffect(() => {
    let isMounted = true;
    
    async function checkSession() {
      setLoadingSession(true);
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        if (isMounted) {
          setUser(data.session || null);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoadingSession(false);
        }
      }
    }
    checkSession();
    
    return () => {
      isMounted = false;
    };
  }, [pathname]); // Re-check session on pathname change

  // Effect to handle routing logic after session state is determined
  useEffect(() => {
    // Wait until the session check is complete
    if (loadingSession) {
      return;
    }

    const isProtectedRoute = protectedRoutes.includes(pathname);
    const isPublicRoute = publicRoutes.includes(pathname);

    // If user is on a protected route and is not logged in, redirect to login
    if (isProtectedRoute && !user) {
      router.push('/login');
    } 
    // If user is on a public route and is logged in, redirect to home
    else if (isPublicRoute && user) {
      router.push('/');
    }

  }, [pathname, user, loadingSession, router]);


  if (loadingSession) {
    return (
       <html lang="en" suppressHydrationWarning>
        <body>
          <div className="flex items-center justify-center min-h-screen">
            {/* You can add a more sophisticated loader here */}
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
