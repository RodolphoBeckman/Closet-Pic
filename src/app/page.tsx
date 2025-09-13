'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FileImage, Upload, LayoutGrid, List } from 'lucide-react';
import Header from '@/components/header';
import { ImageUploadDialog } from '@/components/image-upload-dialog';
import type { StoredImage, GroupedImage } from '@/types';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
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

type ViewMode = 'table' | 'gallery';

export default function Home() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');


  const handleImagesUploaded = (uploadedImages: StoredImage[]) => {
    setImages((prevImages) => [...uploadedImages, ...prevImages]);
  };

  const groupedAndFilteredImages = useMemo(() => {
    // 1. Group images by referencia
    const grouped: { [key: string]: GroupedImage } = images.reduce((acc, image) => {
      const ref = image.referencia || 'sem-referencia';
      if (!acc[ref]) {
        acc[ref] = {
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

    let filteredGroups = Object.values(grouped);

    // 2. Filter the groups
    if (searchQuery) {
      filteredGroups = filteredGroups.filter((group) =>
        group.marca?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (date) {
      const formattedDate = format(date, 'dd/MM/yyyy');
      filteredGroups = filteredGroups.filter((group) => {
        if (!group.dia || !group.mes || !group.ano) return false;
        const monthNames: { [key: string]: string } = {
          'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
          'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
          'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
        };
        const imageMonth = monthNames[group.mes.toLowerCase()];
        const imageDateStr = `${group.dia}/${imageMonth}/${group.ano}`;
        return imageDateStr === formattedDate;
      });
    }
    
    // Sort by most recent
    filteredGroups.sort((a, b) => {
      const dateA = new Date(`${a.ano}-${a.mes}-${a.dia} ${a.dataRegistrada?.split(' ')[3] || '00:00'}`).getTime();
      const dateB = new Date(`${b.ano}-${b.mes}-${b.dia} ${b.dataRegistrada?.split(' ')[3] || '00:00'}`).getTime();
      return (b.dataRegistrada ? new Date(b.dataRegistrada).getTime() : 0) - (a.dataRegistrada ? new Date(a.dataRegistrada).getTime() : 0);
    });

    return filteredGroups;
  }, [images, searchQuery, date]);
  
  const clearFilters = () => {
    setSearchQuery('');
    setDate(undefined);
  }
  
  const currentImage = useMemo(() => {
    if (!selectedImage) return null;
    const allImages = images;
    return allImages.find(img => img.id === selectedImage) || null;
  }, [selectedImage, images]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header>
        <ImageUploadDialog onImagesUploaded={handleImagesUploaded}>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </Button>
        </ImageUploadDialog>
      </Header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
              <Input
                type="search"
                placeholder="Filtrar por marca..."
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
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Filtrar por data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
               {(searchQuery || date) && (
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
          {groupedAndFilteredImages.length > 0 ? (
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
                    {groupedAndFilteredImages.map((group) => (
                      <TableRow key={group.referencia}>
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
                    imageGroups={groupedAndFilteredImages}
                    onImageClick={(id) => setSelectedImage(id)}
                />
            )
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center mt-8">
              <FileImage className="h-16 w-16 text-muted-foreground/50" />
              <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                {images.length > 0 ? 'Nenhuma imagem encontrada' : 'Nenhuma imagem cadastrada'}
              </h2>
              <p className="mt-2 text-muted-foreground">
                 {images.length > 0 ? 'Tente um filtro diferente ou limpe a seleção.' : 'Comece a cadastrar suas imagens.'}
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
