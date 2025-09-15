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
import { Loader2, UploadCloud, Files, X, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { StoredImage } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type ImageUploadDialogProps = {
  onImageUploaded: (image: StoredImage) => void;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

interface UploadFile {
  file: File;
  previewUrl: string;
}

interface UploadGroup {
    id: string;
    referencia: string;
    marca: string;
    files: UploadFile[];
}

export function ImageUploadDialog({ onImageUploaded, children, open: controlledOpen, onOpenChange: setControlledOpen }: ImageUploadDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [uploadGroups, setUploadGroups] = useState<UploadGroup[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;
  
  const addGroup = () => {
    setUploadGroups(prev => [...prev, { id: crypto.randomUUID(), referencia: '', marca: '', files: [] }]);
  };

  useEffect(() => {
    // Start with one group by default when dialog opens
    if (open && uploadGroups.length === 0) {
      addGroup();
    }
  }, [open]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, groupId: string) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const validationErrors: string[] = [];

      Array.from(selectedFiles).forEach(file => {
        if (file.size > 4.5 * 1024 * 1024) { // 4.5MB limit
          validationErrors.push(`${file.name} is too large (max 4.5MB).`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const newFile = { file, previewUrl: reader.result as string };
            setUploadGroups(prev => prev.map(group => 
                group.id === groupId 
                ? { ...group, files: [...group.files, newFile] }
                : group
            ));
        };
        reader.readAsDataURL(file);
      });

      if (validationErrors.length > 0) {
        toast({
          title: 'Some files were not added',
          description: validationErrors.join('\n'),
          variant: 'destructive',
        });
      }
    }
  };

  const resetState = () => {
    setUploadGroups([]);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    setOpen(isOpen);
  }

  const handleUpload = async () => {
    const validGroups = uploadGroups.filter(g => g.files.length > 0 && g.referencia);
    if (validGroups.length === 0) {
      toast({
        title: 'Nenhum grupo válido para upload',
        description: 'Certifique-se de que cada grupo tenha uma referência e pelo menos uma imagem.',
        variant: 'destructive',
      });
      return;
    }
    
    const baserowApiUrl = localStorage.getItem('baserowApiUrl');
    const baserowApiKey = localStorage.getItem('baserowApiKey');
    const baserowTableId = localStorage.getItem('baserowTableId');

    if (!baserowApiKey || !baserowTableId || !baserowApiUrl) {
        toast({
            title: 'Configuração Incompleta',
            description: 'Por favor, configure a URL, a API Key e o Table ID do Baserow nas configurações.',
            variant: 'destructive',
        });
        return;
    }

    startTransition(async () => {
        let totalFiles = 0;
        let hasError = false;

        for (const group of validGroups) {
            const today = new Date();
            const dia = format(today, 'dd');
            const mes = format(today, 'LLLL', { locale: ptBR });
            const ano = format(today, 'yyyy');
            const dataRegistrada = format(today, "dd 'de' MMMM 'de' yyyy HH:mm", { locale: ptBR });


            const formData = new FormData();
            group.files.forEach(f => formData.append('files', f.file));
            formData.append('referencia', group.referencia);
            formData.append('marca', group.marca);
            formData.append('dia', dia);
            formData.append('mes', mes);
            formData.append('ano', ano);
            formData.append('dataRegistrada', dataRegistrada);
            formData.append('baserowApiUrl', baserowApiUrl);
            formData.append('baserowApiKey', baserowApiKey);
            formData.append('baserowTableId', baserowTableId);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Falha no upload para ref ${group.referencia}: ${errorData.message}`);
                }

                const newRowAsStoredImage = await response.json();
                totalFiles += group.files.length;
                onImageUploaded(newRowAsStoredImage);

            } catch (error: any) {
                hasError = true;
                console.error('Upload error for group:', group.referencia, error);
                toast({
                    title: `Erro no Upload do grupo ${group.referencia}`,
                    description: error.message || 'Não foi possível enviar as imagens. Verifique o console.',
                    variant: 'destructive',
                });
            }
        }
      
        if (totalFiles > 0) {
            toast({
                title: 'Upload Concluído',
                description: `${totalFiles} imagem(ns) enviada(s) com sucesso.`,
            });
        }
        
        if (!hasError) {
             handleOpenChange(false);
        }
    });
  };
  
  const removeFile = (groupId: string, fileName: string) => {
    setUploadGroups(prev => prev.map(group => 
        group.id === groupId
        ? { ...group, files: group.files.filter(f => f.file.name !== fileName)}
        : group
    ));
  }

  const removeGroup = (groupId: string) => {
    setUploadGroups(prev => prev.filter(group => group.id !== groupId));
  };
  
  const updateGroupField = (groupId: string, field: 'referencia' | 'marca', value: string) => {
    setUploadGroups(prev => prev.map(group => 
        group.id === groupId
        ? { ...group, [field]: value }
        : group
    ));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    const input = document.createElement('input');
    input.type = 'file';
    input.files = droppedFiles;
    input.multiple = true;
    handleFileChange({ target: input } as any, groupId);
  };


  const triggerButton = (
    <div className="w-full">
      <Label htmlFor="picture-upload-hidden" className="w-full">
        {children}
      </Label>
      <Input
        id="picture-upload-hidden"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
            if(uploadGroups.length > 0) {
                handleFileChange(e, uploadGroups[0].id)
                if(!open) setOpen(true);
            }
        }}
        multiple
      />
    </div>
  );


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Upload de Imagens</DialogTitle>
          <DialogDescription>
            Crie grupos por referência, adicione as imagens e envie tudo de uma vez.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <ScrollArea className="h-[60vh] w-full pr-4">
            <div className="space-y-6">
            {uploadGroups.length > 0 ? (
                uploadGroups.map((group, groupIndex) => (
                    <Card key={group.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, group.id)}>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>Grupo de Upload #{groupIndex + 1}</CardTitle>
                            {uploadGroups.length > 1 && (
                                <Button variant="ghost" size="icon" onClick={() => removeGroup(group.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                <Label htmlFor={`referencia-${group.id}`}>Referência *</Label>
                                <Input id={`referencia-${group.id}`} placeholder="Ex: 04199-A" value={group.referencia} onChange={(e) => updateGroupField(group.id, 'referencia', e.target.value)} />
                                </div>
                                <div>
                                <Label htmlFor={`marca-${group.id}`}>Marca</Label>
                                <Input id={`marca-${group.id}`} placeholder="Ex: Nike" value={group.marca} onChange={(e) => updateGroupField(group.id, 'marca', e.target.value)} />
                                </div>
                            </div>
                            
                            {group.files.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {group.files.map(({file, previewUrl}) => (
                                        <div key={file.name} className="relative group aspect-square">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={() => removeFile(group.id, file.name)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <Image src={previewUrl} alt={file.name} fill sizes="(max-width: 768px) 33vw, 20vw" className="rounded-md object-cover" />
                                        </div>
                                    ))}
                                    <Label htmlFor={`picture-upload-${group.id}`} className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                        <Files className="w-8 h-8 text-muted-foreground" />
                                    </Label>
                                    <Input id={`picture-upload-${group.id}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, group.id)} multiple />

                                </div>
                            ): (
                                <Label htmlFor={`picture-upload-${group.id}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-center text-muted-foreground"><span className="font-semibold text-primary">Clique ou arraste</span> para adicionar imagens</p>
                                    </div>
                                    <Input id={`picture-upload-${group.id}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, group.id)} multiple />
                                </Label>
                            )}
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                    <p className="mt-2 text-muted-foreground">
                        Clique em "Adicionar Grupo" para começar.
                    </p>
                </div>
            )}
            </div>
          </ScrollArea>
           <Button variant="outline" onClick={addGroup}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Grupo de Upload
            </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={uploadGroups.filter(g => g.files.length > 0).length === 0 || isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Salvar Grupos ({uploadGroups.reduce((acc, g) => acc + g.files.length, 0)})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
