
'use client';

import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from 'lucide-react';
import type { User } from '@/types';

type HeaderProps = {
    user: User | null;
}

export default function Header({ user }: HeaderProps) {

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login'; // Redirect to login after logout
  };
  
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

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
            {user && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </nav>
      </div>
    </header>
  );
}
