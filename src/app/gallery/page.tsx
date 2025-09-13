'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FileImage, Upload, LayoutGrid, List } from 'lucide-react';
import Header from '@/components/header';
import { ImageUploadDialog } from '@/components/image-upload-dialog';
import type { StoredImage, GroupedImage, GalleryGroupedImage } from '@/types';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, parse } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ImageViewer } from '@/components/image-viewer';
import { GalleryView } from '@/components/gallery-view';
import { useSearchParams, useRouter } from 'next/navigation';

type ViewMode = 'table' | 'gallery';

export default function GalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialImages: StoredImage[] = useMemo(() => {
    const imagesParam = searchParams.get('images');
    if (imagesParam) {
      try {
        const decodedImages = JSON.parse(decodeURIComponent(imagesParam));
        // Simple validation
        if (Array.isArray(decodedImages)) {
          return decodedImages;
        }
      } catch (error) {
        console.error("Failed to parse images from URL", error);
      }
    }
    return [];
  }, [searchParams]);

  const [images, setImages] = useState<StoredImage[]>(initialImages);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');


  const handleImagesUploaded = (uploadedImages: StoredImage[]) => {
    const allImages = [...uploadedImages, ...images];
    setImages(allImages);
    const imagesParam = encodeURIComponent(JSON.stringify(allImages));
    // We replace the history state to avoid a huge URL if the user manually refreshes.
    router.replace(`/gallery?images=${imagesParam}`);
  };

  const filteredImages = useMemo(() => {
    let filtered = images;
    if (searchQuery) {
        filtered = filtered.filter((image) =>
            image.marca?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            image.referencia?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    if (dateRange?.from) {
      filtered = filtered.filter((image) => {
        if (!image.dataRegistrada) return false;
        try {
          const imageDate = parse(image.dataRegistrada, "dd 'de' MMMM 'de' yyyy HH:mm", new Date(), { locale: ptBR });
          if (dateRange.to) {
            return imageDate >= dateRange.from && imageDate <= dateRange.to;
          }
          // If only from is selected, check if it's on the same day
          return imageDate.toDateString() === dateRange.from?.toDateString();
        } catch (error) {
          console.error("Error parsing date:", image.dataRegistrada, error);
          return false;
        }
      });
    }

    // Sort by most recent
    filtered.sort((a, b) => {
      const dateA = a.dataRegistrada ? parse(a.dataRegistrada, "dd 'de' MMMM 'de' yyyy HH:mm", new Date(), { locale: ptBR }).getTime() : 0;
      const dateB = b.dataRegistrada ? parse(b.dataRegistrada, "dd 'de' MMMM 'de' yyyy HH:mm", new Date(), { locale: ptBR }).getTime() : 0;
      return dateB - dateA;
    });

    return filtered;
  }, [images, searchQuery, dateRange]);


  const tableGroupedImages: GroupedImage[] = useMemo(() => {
    const grouped: { [key: string]: GroupedImage } = filteredImages.reduce((acc, image) => {
      const ref = image.referencia || 'sem-referencia';
      if (!acc[ref]) {
        acc[ref] = {
          groupKey: ref,
          referencia: image.referencia || '-',
          marca: image.marca,
          dia: image.dia,
          mes: image.mes,
          ano: image.ano,
          dataRegistrada: image.dataRegistrada,
          images: [],
        };
      }
      acc[ref].images.push({ id: image.id, src: image.src, alt: image.alt });
      return acc;
    }, {} as { [key: string]: GroupedImage });

    return Object.values(grouped);
  }, [filteredImages]);

  const galleryGroupedImages: GalleryGroupedImage[] = useMemo(() => {
    const groupedByMarca: { [key: string]: { marca: string, references: { [key:string]: GroupedImage } } } = filteredImages.reduce((acc, image) => {
      const marca = image.marca || 'sem-marca';
      if (!acc[marca]) {
        acc[marca] = {
          marca: image.marca || '-',
          references: {}
        };
      }
      
      const ref = image.referencia || 'sem-referencia';
      if (!acc[marca].references[ref]) {
          acc[marca].references[ref] = {
              groupKey: ref,
              referencia: image.referencia || '-',
              marca: image.marca,
              dia: image.dia,
              mes: image.mes,
              ano: image.ano,
              dataRegistrada: image.dataRegistrada,
              images: [],
          };
      }
      acc[marca].references[ref].images.push({ id: image.id, src: image.src, alt: image.alt });
      return acc;
    }, {} as { [key: string]: { marca: string, references: { [key:string]: GroupedImage } } });

    return Object.values(groupedByMarca).map(group => ({
        marca: group.marca,
        items: Object.values(group.references),
    }));
  }, [filteredImages]);

  const clearFilters = () => {
    setSearchQuery('');
    setDateRange(undefined);
  }
  
  const currentImage = useMemo(() => {
    if (!selectedImage) return null;
    const allImages = images;
    return allImages.find(img => img.id === selectedImage) || null;
  }, [selectedImage, images]);

  const noResults = images.length > 0 && (viewMode === 'table' ? tableGroupedImages.length === 0 : galleryGroupedImages.length === 0);

  if (images.length === 0) {
    router.push('/');
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
            <ImageUploadDialog onImagesUploaded={handleImagesUploaded}>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                </Button>
            </ImageUploadDialog>
            <Input
            type="search"
            placeholder="Filtrar por marca ou referência..."
            className="w-full sm:max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Popover>
            <PopoverTrigger asChild>
                <Button
                variant={"outline"}
                className={cn(
                    "w-full sm:max-w-xs justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                    dateRange.to ? (
                    <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                    </>
                    ) : (
                    format(dateRange.from, "LLL dd, y")
                    )
                ) : (
                    <span>Filtrar por data</span>
                )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
                />
            </PopoverContent>
            </Popover>
            {(searchQuery || dateRange) && (
            <Button variant="ghost" onClick={clearFilters}>Limpar filtros</Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('table')}>
                <List className="h-5 w-5" />
                <span className="sr-only">Table View</span>
            </Button>
            <Button variant={viewMode === 'gallery' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('gallery')}>
                <LayoutGrid className="h-5 w-5" />
                <span className="sr-only">Gallery View</span>
            </Button>
            </div>
          </div>
          {!noResults ? (
            viewMode === 'table' ? (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referência</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Fotos</TableHead>
                      <TableHead>Data registrada</TableHead>
                      <TableHead>Dia</TableHead>
                      <TableHead>Mês</TableHead>
                      <TableHead>Ano</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableGroupedImages.map((group) => (
                      <TableRow key={group.groupKey}>
                        <TableCell>{group.referencia}</TableCell>
                        <TableCell><Badge variant="outline">{group.marca || '-'}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {group.images.map(image => (
                              <button key={image.id} onClick={() => setSelectedImage(image.id)} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md">
                                <Image
                                  src={image.src}
                                  alt={image.alt}
                                  width={40}
                                  height={40}
                                  className="rounded-md object-cover cursor-pointer"
                                />
                              </button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{group.dataRegistrada || '-'}</TableCell>
                        <TableCell>{group.dia || '-'}</TableCell>
                        <TableCell className="capitalize">{group.mes || '-'}</TableCell>
                        <TableCell>{group.ano || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
                <GalleryView
                    imageGroups={galleryGroupedImages}
                    onImageClick={(id) => setSelectedImage(id)}
                />
            )
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center mt-8">
              <FileImage className="h-16 w-16 text-muted-foreground/50" />
              <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                Nenhuma imagem encontrada
              </h2>
              <p className="mt-2 text-muted-foreground">
                 Tente um filtro diferente ou limpe a seleção.
              </p>
            </div>
          )}
        </div>
      </main>
      
      {currentImage && (
        <ImageViewer
          src={currentImage.src}
          alt={currentImage.alt}
          isOpen={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        />
      )}
    </div>
  );
}
