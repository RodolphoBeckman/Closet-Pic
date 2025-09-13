import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StoredImage } from '@/types';

type ImageCardProps = {
  image: StoredImage;
};

export default function ImageCard({ image }: ImageCardProps) {
  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-lg flex flex-col">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          data-ai-hint={image.hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="capitalize backdrop-blur-sm bg-black/20 text-white border-none">{image.category}</Badge>
        </div>
      </div>
      {(image.referencia || image.marca || image.dia || image.mes || image.ano) && (
        <CardContent className="p-4 flex-grow">
          {image.referencia && <p className="text-sm text-muted-foreground">Ref: {image.referencia}</p>}
          {image.marca && <p className="font-bold">{image.marca}</p>}
        </CardContent>
      )}
       {(image.dia || image.mes || image.ano) && (
        <CardFooter className="p-4 pt-0">
          <p className="text-xs text-muted-foreground">{image.dia} {image.mes && `de ${image.mes}`} {image.ano}</p>
        </CardFooter>
      )}
    </Card>
  );
}
