"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [baserowApiKey, setBaserowApiKey] = useState('');
  const [baserowTableId, setBaserowTableId] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, you would securely save these keys.
    // For now, we'll just show a toast message.
    console.log({ baserowApiKey, baserowTableId });
    toast({
      title: 'Configurações Salvas',
      description: 'Suas chaves de integração do Baserow foram salvas (simulado).',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Configurações</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de Integração</DialogTitle>
          <DialogDescription>
            Conecte o ClosetPic ao Baserow para usar como seu banco de dados de imagens.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="baserow-api-key">Chave da API do Baserow</Label>
            <Input
              id="baserow-api-key"
              type="password"
              placeholder="secret_..."
              value={baserowApiKey}
              onChange={(e) => setBaserowApiKey(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="baserow-table-id">ID da Tabela do Baserow</Label>
            <Input
              id="baserow-table-id"
              placeholder="12345"
              value={baserowTableId}
              onChange={(e) => setBaserowTableId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
