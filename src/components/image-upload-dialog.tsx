'use client';

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
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
import { Loader2, UploadCloud, Files, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { StoredImage } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ImageUploadDialogProps = {
  onImagesUploaded: (images: StoredImage[]) => void;
  children: React.ReactNode;
};

interface UploadFile {
  file: File;
  previewUrl: string;
}

export function ImageUploadDialog({ onImagesUploaded, children }: ImageUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [referencia, setReferencia] = useState('');
  const [marca, setMarca] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles: UploadFile[] = [];
      const validationErrors: string[] = [];

      Array.from(selectedFiles).forEach(file => {
        if (file.size > 4 * 1024 * 1024) { // 4MB limit
          validationErrors.push(`${file.name} is too large (max 4MB).`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          newFiles.push({ file, previewUrl: reader.result as string });
          // If all files are processed
          if (newFiles.length + validationErrors.length === selectedFiles.length) {
            setFiles(prev => [...prev, ...newFiles]);
            if (validationErrors.length > 0) {
              toast({
                title: 'Some files were not added',
                description: validationErrors.join('\n'),
                variant: 'destructive',
              });
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const resetState = () => {
    setFiles([]);
    setReferencia('');
    setMarca('');
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    setOpen(isOpen);
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Selecione uma ou mais imagens para fazer o upload.',
        variant: 'destructive',
      });
      return;
    }

    const today = new Date();
    const dia = format(today, 'dd');
    const mes = format(today, 'LLLL', { locale: ptBR }); // Full month name in Portuguese
    const ano = format(today, 'yyyy');
    const dataRegistrada = format(today, "dd 'de' MMMM 'de' yyyy HH:mm", { locale: ptBR });

    startTransition(() => {
      const uploadedImages: StoredImage[] = files.map(({ file, previewUrl }) => ({
        id: `${new Date().toISOString()}-${file.name}`,
        src: previewUrl,
        category: 'default',
        alt: file.name,
        referencia: referencia || undefined,
        marca: marca || undefined,
        dia,
        mes,
        ano,
        dataRegistrada,
      }));
      
      onImagesUploaded(uploadedImages);
      toast({
        title: 'Upload Completo',
        description: `${uploadedImages.length} imagem(ns) carregada(s) com sucesso.`,
      });
      
      handleOpenChange(false);
    });
  };
  
  const removeFile = (fileName: string) => {
    setFiles(files.filter(f => f.file.name !== fileName));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upload de Imagens</DialogTitle>
          <DialogDescription>
            Adicione as informações para o grupo de imagens. A data será preenchida automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {files.length > 0 ? (
             <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="referencia-geral">Referência</Label>
                  <Input id="referencia-geral" placeholder="Ex: 04199-A" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="marca-geral">Marca</Label>
                  <Input id="marca-geral" placeholder="Ex: Nike" value={marca} onChange={(e) => setMarca(e.target.value)} />
                </div>
              </div>
               <ScrollArea className="h-80 w-full pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map(({file, previewUrl}) => (
                    <div key={file.name} className="relative group aspect-square">
                       <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => removeFile(file.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Image src={previewUrl} alt={file.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" className="rounded-md object-cover" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button variant="outline" className="w-full" asChild>
                <Label htmlFor="picture-upload-more">
                  <Files className="mr-2 h-4 w-4" />
                  Adicionar mais imagens
                </Label>
              </Button>
               <Input id="picture-upload-more" type="file" className="hidden" accept="image/*" onChange={handleFileChange} multiple />
            </div>
          ) : (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="picture-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Clique para fazer upload</span> ou arraste e solte</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF até 4MB</p>
                </div>
              </Label>
              <Input id="picture-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} multiple />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0 || isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Salvar {files.length > 0 ? `(${files.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
