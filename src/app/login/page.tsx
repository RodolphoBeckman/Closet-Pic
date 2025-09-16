
"use client";

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Campos em falta',
        description: 'Por favor, preencha o email e a password.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Falha ao fazer login.');
        }

        toast({
          title: 'Login bem-sucedido!',
          description: 'A redirecionar para a página principal...',
        });
        
        // Force a full page reload to ensure middleware runs correctly
        window.location.href = '/';

      } catch (error: any) {
        toast({
          title: 'Erro de Login',
          description: error.message || 'Ocorreu um erro inesperado.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-8 flex items-center gap-2">
         <Image src="/LOGO.png" alt="ClosetPic Logo" width={32} height={32} />
         <span className="text-xl font-bold">ClosetPic</span>
      </div>
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Insira o seu email para aceder à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{' '}
            <Link href="/register" className="underline">
              Registar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
