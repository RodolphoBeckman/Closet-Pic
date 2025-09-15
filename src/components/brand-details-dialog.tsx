"use client"

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { BrandDetailItem } from '@/types';

type BrandDetailsDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  brand: string;
  details: BrandDetailItem[];
  onImageClick: (imageId: string) => void;
};

export function BrandDetailsDialog({ isOpen, onOpenChange, brand, details, onImageClick }: BrandDetailsDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Detalhes da Marca: {brand}</DialogTitle>
          <DialogDescription>
            Mostrando todas as referências para esta marca.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full pr-4">
            <div className="space-y-4">
                {details.map((item, index) => (
                    <div key={item.groupKey}>
                        <h3 className="text-lg font-semibold mb-2">Ref: {item.referencia}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {item.images.map(image => (
                                <button 
                                    key={image.id} 
                                    onClick={() => onImageClick(image.id)} 
                                    className="relative aspect-square focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md overflow-hidden"
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                        {index < details.length - 1 && <Separator className="my-4" />}
                    </div>
                ))}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
