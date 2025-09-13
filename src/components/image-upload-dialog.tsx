'use client';

import { useState, useTransition } from 'react';
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
import { getCategoryForImage } from '@/app/actions';
import { Loader2, UploadCloud, FileImage, Files } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { StoredImage } from '@/types';
import { ScrollArea } from './ui/scroll-area';

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
        title: 'No files selected',
        description: 'Please select one or more image files to upload.',
        variant: 'destructive',
      });
      return;
    }

    const today = new Date();
    const dia = String(today.getDate()).padStart(2, '0');
    const mes = today.toLocaleString('default', { month: 'long' });
    const ano = String(today.getFullYear());

    startTransition(async () => {
      const uploadedImages: StoredImage[] = [];
      let failureCount = 0;

      await Promise.all(
        files.map(async ({ file, previewUrl }) => {
          const { category, referencia, marca, error } = await getCategoryForImage(previewUrl);

          if (error || !category) {
            failureCount++;
          } else {
            uploadedImages.push({
              id: `${new Date().toISOString()}-${file.name}`,
              src: previewUrl,
              category,
              alt: file.name,
              referencia: referencia || undefined,
              marca: marca || undefined,
              dia,
              mes,
              ano,
            });
          }
        })
      );
      
      if (uploadedImages.length > 0) {
        onImagesUploaded(uploadedImages);
        toast({
          title: 'Upload Complete',
          description: `${uploadedImages.length} image(s) uploaded and categorized successfully.`,
        });
      }

      if (failureCount > 0) {
         toast({
          title: 'Some Uploads Failed',
          description: `${failureCount} image(s) could not be categorized.`,
          variant: 'destructive',
        });
      }

      if (uploadedImages.length > 0 || failureCount > 0) {
        handleOpenChange(false);
      }
    });
  };
  
  const removeFile = (fileName: string) => {
    setFiles(files.filter(f => f.file.name !== fileName));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
          <DialogDescription>
            Select images from your device. We&apos;ll automatically categorize them for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {files.length > 0 ? (
            <div className="space-y-4">
               <ScrollArea className="h-64 w-full pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map(({file, previewUrl}) => (
                    <div key={file.name} className="relative group">
                      <Image src={previewUrl} alt={file.name} width={150} height={150} className="rounded-md object-cover aspect-square" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => removeFile(file.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button variant="outline" className="w-full" asChild>
                <Label htmlFor="picture-upload-more">
                  <Files className="mr-2 h-4 w-4" />
                  Add more images
                </Label>
              </Button>
               <Input id="picture-upload-more" type="file" className="hidden" accept="image/*" onChange={handleFileChange} multiple />
            </div>
          ) : (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="picture-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 4MB</p>
                </div>
              </Label>
              <Input id="picture-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} multiple />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0 || isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Upload & Categorize {files.length > 0 ? `(${files.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add this to src/components/ui/dialog.tsx to support X icon on remove button
// import { X } from "lucide-react"
// And in the Button component just use <X className="h-4 w-4" />
// The `lucide-react` library is already a dependency.
// Adding a new `ScrollArea` component to `src/components/ui/scroll-area.tsx`
// as it is used here and is a standard shadcn component.
// Adding a new `Files` icon to lucide-react, as it is used here.
