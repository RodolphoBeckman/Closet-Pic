
'use client';

import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';

export default function Header() {

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex-1 flex items-center">
            {/* Can add nav items here */}
        </div>
        <div className="flex-1 flex justify-center">
          <a href="/" className="flex items-center space-x-2">
            <Image src="/LOGO.png" alt="ClosetPic Logo" width={32} height={32} />
            <span className="font-bold sm:inline-block bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text drop-shadow-[0_0_0.3rem_#ffffff40]">ClosetPic</span>
          </a>
        </div>
        <nav className="flex-1 flex items-center justify-end gap-2">
            <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
