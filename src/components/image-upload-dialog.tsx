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
import { Loader2, UploadCloud, FileImage, Files, X } from 'lucide-react';
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
  referencia: string;
  marca: string;
}

export function ImageUploadDialog({ onImagesUploaded, children }: ImageUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
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
          newFiles.push({ file, previewUrl: reader.result as string, referencia: '', marca: '' });
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

  const handleFieldChange = (index: number, field: 'referencia' | 'marca', value: string) => {
    const updatedFiles = [...files];
    updatedFiles[index][field] = value;
    setFiles(updatedFiles);
  };

  const resetState = () => {
    setFiles([]);
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

    startTransition(() => {
      const uploadedImages: StoredImage[] = files.map(({ file, previewUrl, referencia, marca }) => ({
        id: `${new Date().toISOString()}-${file.name}`,
        src: previewUrl,
        category: 'default',
        alt: file.name,
        referencia: referencia || undefined,
        marca: marca || undefined,
        dia,
        mes,
        ano,
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
            Adicione as informações para cada imagem. A data será preenchida automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {files.length > 0 ? (
            <div className="space-y-4">
               <ScrollArea className="h-96 w-full pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {files.map(({file, previewUrl}, index) => (
                    <div key={file.name} className="relative group border rounded-lg p-4 space-y-4">
                       <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(file.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className='flex items-start gap-4'>
                        <Image src={previewUrl} alt={file.name} width={100} height={100} className="rounded-md object-cover aspect-square" />
                        <div className="w-full space-y-2">
                           <p className="text-sm font-medium text-muted-foreground truncate">{file.name}</p>
                           <div>
                            <Label htmlFor={`referencia-${index}`} className='text-xs'>Referência</Label>
                            <Input id={`referencia-${index}`} placeholder="Ex: 04199-A" onChange={(e) => handleFieldChange(index, 'referencia', e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor={`marca-${index}`} className='text-xs'>Marca</Label>
                            <Input id={`marca-${index}`} placeholder="Ex: Nike" onChange={(e) => handleFieldChange(index, 'marca', e.target.value)} />
                          </div>
                        </div>
                      </div>
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
