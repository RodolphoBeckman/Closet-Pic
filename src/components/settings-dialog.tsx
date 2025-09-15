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
  const [notionApiKey, setNotionApiKey] = useState('');
  const [notionDatabaseId, setNotionDatabaseId] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, you would securely save these keys.
    // For now, we'll just show a toast message.
    console.log({ notionApiKey, notionDatabaseId });
    toast({
      title: 'Configurações Salvas',
      description: 'Suas chaves de integração do Notion foram salvas (simulado).',
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
            Conecte o ClosetPic ao Notion para usar como seu banco de dados de imagens.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="notion-api-key">Notion API Key</Label>
            <Input
              id="notion-api-key"
              type="password"
              placeholder="secret_..."
              value={notionApiKey}
              onChange={(e) => setNotionApiKey(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notion-database-id">Notion Database ID</Label>
            <Input
              id="notion-database-id"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={notionDatabaseId}
              onChange={(e) => setNotionDatabaseId(e.target.value)}
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
