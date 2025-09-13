'use client';

import { Camera } from 'lucide-react';

type HeaderProps = {
  children?: React.ReactNode;
};

export default function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-center">
        <div className="flex items-center space-x-2">
          <a href="/" className="flex items-center space-x-2">
            <Camera className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">ImageKeep</span>
          </a>
        </div>
        {children && (
          <div className="flex flex-1 items-center justify-end">
            <nav className="flex items-center">
              {children}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
