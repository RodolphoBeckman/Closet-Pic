"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download } from 'lucide-react';

type ImageViewerProps = {
  src: string;
  alt: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImageViewer({ src, alt, isOpen, onOpenChange }: ImageViewerProps) {

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'downloaded-image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <div className="relative aspect-video w-full">
            <Image 
                src={src} 
                alt={alt} 
                fill 
                className="object-contain"
            />
        </div>
        <DialogFooter className="p-4 bg-background/80 backdrop-blur-sm">
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
