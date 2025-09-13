'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { FileImage, Upload } from 'lucide-react';
import Header from '@/components/header';
import { ImageUploadDialog } from '@/components/image-upload-dialog';
import ImageCard from '@/components/image-card';
import type { StoredImage } from '@/types';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Home() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>();

  const handleImagesUploaded = (uploadedImages: StoredImage[]) => {
    setImages((prevImages) => [...uploadedImages, ...prevImages]);
  };

  const filteredImages = useMemo(() => {
    let filtered = images;

    if (searchQuery) {
      filtered = filtered.filter((image) =>
        image.marca?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (date) {
      const formattedDate = format(date, 'dd/MM/yyyy');
      filtered = filtered.filter((image) => {
        if (!image.dia || !image.mes || !image.ano) return false;
        // Assuming mes is a full month name like 'janeiro', 'fevereiro'
        const monthNames: { [key: string]: string } = {
          'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
          'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
          'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
        };
        const imageMonth = monthNames[image.mes.toLowerCase()];
        const imageDateStr = `${image.dia}/${imageMonth}/${image.ano}`;
        return imageDateStr === formattedDate;
      });
    }

    return filtered;
  }, [images, searchQuery, date]);
  
  const clearFilters = () => {
    setSearchQuery('');
    setDate(undefined);
  }

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
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
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
          </div>
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredImages.map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
            </div>
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
    </div>
  );
}
