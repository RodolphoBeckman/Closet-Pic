'use client';

import { Camera } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <a href="/" className="flex items-center space-x-2">
            <Camera className="h-6 w-6 bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text" />
            <span className="font-bold sm:inline-block bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text drop-shadow-[0_0_0.3rem_#ffffff40]">ImageKeep</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search can go here if needed */}
          </div>
          <nav className="flex items-center">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
