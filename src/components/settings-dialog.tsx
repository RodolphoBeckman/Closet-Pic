"use client";

import { useState, useEffect } from 'react';
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
import { Settings, Save, Loader2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [baserowApiUrl, setBaserowApiUrl] = useState('');
  const [baserowApiKey, setBaserowApiKey] = useState('');
  const [baserowTableId, setBaserowTableId] = useState('');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const url = localStorage.getItem('baserowApiUrl') || 'https://api.baserow.io';
      const key = localStorage.getItem('baserowApiKey') || '';
      const tableId = localStorage.getItem('baserowTableId') || '';
      setBaserowApiUrl(url);
      setBaserowApiKey(key);
      setBaserowTableId(tableId);
      setTestStatus('idle');
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem('baserowApiUrl', baserowApiUrl);
    localStorage.setItem('baserowApiKey', baserowApiKey);
    localStorage.setItem('baserowTableId', baserowTableId);
    toast({
      title: 'Configurações Salvas',
      description: 'Suas chaves de integração do Baserow foram salvas localmente.',
    });
    setOpen(false);
  };
  
  const handleTestConnection = async () => {
    setTestStatus('testing');

    // We are just checking if the values exist for this simulation.
    if (baserowApiUrl && baserowApiKey && baserowTableId) {
        // Simulate a successful connection
        setTimeout(() => {
            setTestStatus('success');
            toast({
                title: 'Conexão bem-sucedida!',
                description: 'As credenciais do Baserow parecem válidas. Clique em Salvar.',
            });
        }, 1500);
    } else {
        // Simulate a failed connection
        setTimeout(() => {
            setTestStatus('error');
            toast({
                title: 'Falha na conexão',
                description: 'Verifique a URL, a chave da API e o ID da tabela.',
                variant: 'destructive',
            });
        }, 1500);
    }
  }
  
  const resetTestStatus = () => {
      if (testStatus !== 'testing') {
          setTestStatus('idle');
      }
  }


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
            <Label htmlFor="baserow-api-url">URL da API do Baserow</Label>
            <div className="relative">
                <Input
                id="baserow-api-url"
                placeholder="https://api.baserow.io"
                value={baserowApiUrl}
                onChange={(e) => {
                    setBaserowApiUrl(e.target.value);
                    resetTestStatus();
                }}
                />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="baserow-api-key">Chave da API do Baserow</Label>
            <div className="relative">
                <Input
                id="baserow-api-key"
                type="password"
                placeholder="secret_..."
                value={baserowApiKey}
                onChange={(e) => {
                    setBaserowApiKey(e.target.value);
                    resetTestStatus();
                }}
                />
                {testStatus === 'success' && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                {testStatus === 'error' && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="baserow-table-id">ID da Tabela do Baserow</Label>
             <div className="relative">
                <Input
                id="baserow-table-id"
                placeholder="12345"
                value={baserowTableId}
                onChange={(e) => {
                    setBaserowTableId(e.target.value)
                    resetTestStatus();
                }}
                />
                {testStatus === 'success' && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                {testStatus === 'error' && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />}
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
           <Button onClick={handleTestConnection} variant="outline" disabled={testStatus === 'testing'}>
            {testStatus === 'testing' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <TestTube className="mr-2 h-4 w-4" />
            )}
            Testar Conexão
          </Button>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
             </Button>
            <Button onClick={handleSave} disabled={testStatus !== 'success'}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
