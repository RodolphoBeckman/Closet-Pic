'use client';

import { Camera, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type HeaderProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  children: React.ReactNode;
};

export default function Header({ searchQuery, setSearchQuery, children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <Camera className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">ImageKeep</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by category..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          <nav className="flex items-center">
            {children}
          </nav>
        </div>
      </div>
    </header>
  );
}
