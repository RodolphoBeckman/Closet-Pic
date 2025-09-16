
'use client';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import type { User } from '@/types';
import { Loader2 } from 'lucide-react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublicRoute, setIsPublicRoute] = useState(false);

  useEffect(() => {
    // Determine if the current path is a public route on the client side.
    const path = window.location.pathname;
    const publicRoutes = ['/login', '/register'];
    setIsPublicRoute(publicRoutes.includes(path));

    const fetchSession = async () => {
      // Only fetch session if it's not a public route
      if (!publicRoutes.includes(path)) {
        try {
          const response = await fetch('/api/auth/session');
          if (response.ok) {
            const data = await response.json();
            if (data.isAuthenticated) {
              setUser(data.user);
            }
          }
        } catch (error) {
          console.error("Failed to fetch session:", error);
        }
      }
      setIsLoading(false);
    };

    fetchSession();
  }, []);


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

  const renderContent = () => {
    if (isLoading && !isPublicRoute) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (isPublicRoute) {
        // For public routes like /login, just render the children without the header
        return children;
    }
    
    // For protected routes, render with the header
    return (
        <>
            <Header user={user} />
            {children}
        </>
    );
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
          {renderContent()}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
