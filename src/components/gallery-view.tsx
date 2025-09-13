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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

type GalleryViewProps = {
  imageGroups: GalleryGroupedImage[];
  onImageClick: (imageId: string) => void;
};

export function GalleryView({ imageGroups, onImageClick }: GalleryViewProps) {
  return (
    <Accordion type="multiple" className="w-full space-y-2">
        {imageGroups.map((group) => (
            <AccordionItem value={group.marca} key={group.marca} className="border rounded-lg px-4 bg-card">
                <AccordionTrigger className="hover:no-underline">
                   <h2 className="text-xl font-bold tracking-tight">{group.marca}</h2>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
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
                </AccordionContent>
            </AccordionItem>
        ))}
    </Accordion>
  );
}
