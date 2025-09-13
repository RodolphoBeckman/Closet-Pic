"use client";

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GroupedImage } from '@/types';

type GalleryViewProps = {
  imageGroups: GroupedImage[];
  onImageClick: (imageId: string) => void;
};

export function GalleryView({ imageGroups, onImageClick }: GalleryViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {imageGroups.map((group) => (
        <Card key={group.referencia} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{group.referencia}</CardTitle>
            <div className="flex items-center justify-between">
                {group.marca && <Badge variant="outline">{group.marca}</Badge>}
                <p className="text-xs text-muted-foreground capitalize">
                  {group.mes} {group.ano}
                </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
                {group.images.map(image => (
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
            <p className="text-xs text-muted-foreground">{group.dataRegistrada}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
