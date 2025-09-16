
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

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !email || !password) {
      toast({
        title: 'Campos em falta',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Falha ao criar conta.');
        }

        toast({
          title: 'Conta criada com sucesso!',
          description: 'Pode agora fazer login.',
        });
        
        // Redirect to login page after successful registration
        window.location.href = '/login';

      } catch (error: any) {
        toast({
          title: 'Erro de Registo',
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
          <CardTitle className="text-xl">Registar</CardTitle>
          <CardDescription>
            Crie uma nova conta para começar a usar a aplicação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Seu Nome"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
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
              Criar Conta
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
