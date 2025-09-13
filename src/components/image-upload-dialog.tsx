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
import { Loader2, UploadCloud, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { StoredImage } from '@/types';

type ImageUploadDialogProps = {
  onImageUploaded: (image: StoredImage) => void;
  children: React.ReactNode;
};

export function ImageUploadDialog({ onImageUploaded, children }: ImageUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit for Genkit flow
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 4MB.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreviewUrl(null);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    setOpen(isOpen);
  }

  const handleUpload = async () => {
    if (!file || !previewUrl) {
      toast({
        title: 'No file selected',
        description: 'Please select an image file to upload.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const { category, error } = await getCategoryForImage(previewUrl);

      if (error || !category) {
        toast({
          title: 'Upload Failed',
          description: error || 'Could not determine image category.',
          variant: 'destructive',
        });
        return;
      }

      onImageUploaded({
        id: new Date().toISOString(),
        src: previewUrl,
        category,
        alt: file.name,
      });

      toast({
        title: 'Upload Successful',
        description: `Image categorized as "${category}".`,
      });

      handleOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>
            Select an image from your device. We&apos;ll automatically categorize it for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {previewUrl ? (
            <div className="space-y-4">
               <div className="relative mx-auto h-48 w-full max-w-sm">
                <Image src={previewUrl} alt="Image preview" fill className="rounded-md object-contain" />
              </div>
              <Button variant="outline" className="w-full" onClick={() => resetState()}>
                <FileImage className="mr-2 h-4 w-4" />
                Choose a different image
              </Button>
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
              <Input id="picture-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Upload & Categorize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
