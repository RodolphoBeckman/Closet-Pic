'use client';

import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import type { UserSession } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogOut, User } from 'lucide-react';
import { deleteSession } from '@/lib/session';
import { useRouter } from 'next/navigation';


function getInitials(name: string) {
    if (!name) return '';
    const names = name.split(' ');
    const first = names[0] ? names[0][0] : '';
    const last = names.length > 1 ? names[names.length - 1][0] : '';
    return `${first}${last}`.toUpperCase();
}


export default function Header({ user }: { user: UserSession | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    await deleteSession();
    // Redireciona para a página de login após o logout. O middleware garantirá que o usuário permaneça lá.
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex-1" />
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
                    <DropdownMenuTrigger>
                        <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/8.x/bottts/svg?seed=${user.email}`} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="flex flex-col">
                           <span className="font-semibold">{user.name}</span>
                           <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                            <User className="mr-2 h-4 w-4" />
                            <span>Perfil</span>
                        </DropdownMenuItem>
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
