"use client";

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GalleryGroupedImage } from '@/types';

type GalleryViewProps = {
  imageGroups: GalleryGroupedImage[];
  onImageClick: (imageId: string) => void;
};

export function GalleryView({ imageGroups, onImageClick }: GalleryViewProps) {
  return (
    <div className="space-y-8">
      {imageGroups.map((group) => (
        <div key={group.marca}>
          <h2 className="text-2xl font-bold tracking-tight mb-4">{group.marca}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {group.items.map((item) => (
              <Card key={item.groupKey} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{item.referencia}</CardTitle>
                  <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.mes} {item.ano}
                      </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                      {item.images.map(image => (
                          <button key={image.id} onClick={() => onImageClick(image.id)} className="relative aspect-square focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md overflow-hidden">
                              <Image
                                  src={image.src}
                                  alt={image.alt}
                                  fill
                                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                  className="object-cover"
                              />
                          </button>
                      ))}
                  </div>
                </CardContent>
                 <CardFooter>
                  <p className="text-xs text-muted-foreground">{item.dataRegistrada}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
