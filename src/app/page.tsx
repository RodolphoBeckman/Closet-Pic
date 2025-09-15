'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FileImage, Upload, LayoutGrid, List, Loader2, BarChart } from 'lucide-react';
import { ImageUploadDialog } from '@/components/image-upload-dialog';
import type { StoredImage, GroupedImage, GalleryGroupedImage, ChartData } from '@/types';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, parse, isValid } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { ptBR } from 'date-ns/locale';
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
import { ChartView } from '@/components/chart-view';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Settings } from 'lucide-react';
import { BrandDetailsDialog } from '@/components/brand-details-dialog';


type ViewMode = 'table' | 'gallery' | 'chart';

function HomePageContent() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [configError, setConfigError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if(error){
      toast({
        title: 'Erro de Login',
        description: error,
        variant: 'destructive'
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/images');

        if (!response.ok) {
          const errorData = await response.json();
          // Special check for config error
          if (response.status === 400 && errorData.message.includes('variáveis de ambiente')) {
             setConfigError(errorData.message);
          } else {
            throw new Error(errorData.message || 'Failed to fetch images.');
          }
          return; // Stop processing if there was an error
        }

        setConfigError(null); // Clear any previous config error
        const data: StoredImage[] = await response.json();
        setImages(data);
      } catch (error: any) {
        console.error("Failed to fetch images:", error);
        toast({
            title: 'Erro ao Carregar Imagens',
            description: error.message || 'Não foi possível buscar as imagens do banco de dados.',
            variant: 'destructive'
        });
        // Set specific error message for config issues
        if (error.message.includes('variáveis de ambiente')) {
            setConfigError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, [toast]);


  const handleImagesUploaded = (uploadedImages: StoredImage[]) => {
    // We receive an array of images for each group uploaded.
    setImages(prev => [...uploadedImages, ...prev]);
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
          if (!isValid(imageDate)) return false;
          
          if (dateRange.to) {
            // Adjust 'to' date to be end of the day
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            return imageDate >= dateRange.from && imageDate <= toDate;
          }
          // If only 'from' is selected, check if it's on the same day
          const fromDate = new Date(dateRange.from);
          return imageDate.getDate() === fromDate.getDate() &&
                 imageDate.getMonth() === fromDate.getMonth() &&
                 imageDate.getFullYear() === fromDate.getFullYear();
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

  const chartData: ChartData[] = useMemo(() => {
    const dataByBrand = filteredImages.reduce((acc, image) => {
      const brand = image.marca || 'Sem Marca';
      const ref = image.referencia;
      if (ref) {
        if (!acc[brand]) {
          acc[brand] = new Set<string>();
        }
        acc[brand].add(ref);
      }
      return acc;
    }, {} as Record<string, Set<string>>);

    return Object.entries(dataByBrand).map(([brand, references]) => ({
      marca: brand,
      referencias: references.size,
    }));
  }, [filteredImages]);


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

  const brandDetails = useMemo(() => {
    if (!selectedBrand) return null;
    const brandImages = filteredImages.filter(img => (img.marca || 'Sem Marca') === selectedBrand);
    const groupedByRef = brandImages.reduce((acc, image) => {
        const ref = image.referencia || 'sem-referencia';
        if (!acc[ref]) {
            acc[ref] = {
                groupKey: ref,
                referencia: image.referencia || '-',
                images: [],
            };
        }
        acc[ref].images.push({ id: image.id, src: image.src, alt: image.alt });
        return acc;
    }, {} as { [key: string]: { groupKey: string; referencia: string; images: { id: string; src: string; alt: string }[] } });
    return Object.values(groupedByRef);
  }, [selectedBrand, filteredImages]);

  const clearFilters = () => {
    setSearchQuery('');
    setDateRange(undefined);
  }
  
  const currentImage = useMemo(() => {
    if (!selectedImage) return null;
    const allImages = images;
    return allImages.find(img => img.id === selectedImage) || null;
  }, [selectedImage, images]);

  const handleBarClick = (data: any) => {
    if (data && data.marca) {
        setSelectedBrand(data.marca);
        setIsDetailsOpen(true);
    }
  }

  const noImages = !isLoading && images.length === 0 && !configError;
  const noFilteredResults = !noImages && filteredImages.length === 0;

  const renderContent = () => {
    if (viewMode === 'table') {
        return (
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
        );
    }
    if (viewMode === 'gallery') {
        return <GalleryView imageGroups={galleryGroupedImages} onImageClick={(id) => setSelectedImage(id)} />;
    }
    if (viewMode === 'chart') {
        return <ChartView data={chartData} onBarClick={handleBarClick} />;
    }
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
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
                <Button variant={viewMode === 'chart' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('chart')}>
                    <BarChart className="h-5 w-5" />
                    <span className="sr-only">Chart View</span>
                </Button>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : configError ? (
            <Alert variant="destructive" className="mt-8">
              <Settings className="h-4 w-4" />
              <AlertTitle>Erro de Configuração</AlertTitle>
              <AlertDescription>
                {configError} Por favor, verifique suas variáveis de ambiente no seu provedor de hospedagem (ex: Vercel) e no seu ficheiro `.env` local.
              </AlertDescription>
            </Alert>
          ) : noImages ? (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center mt-8">
                <div className="flex justify-center items-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4 inline-block">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                    Comece a fazer uploads
                </h2>
                <p className="mt-2 text-muted-foreground">
                    Clique em "Upload Images" para adicionar suas primeiras fotos.
                </p>
             </div>
          ) : noFilteredResults ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center mt-8">
              <FileImage className="h-16 w-16 text-muted-foreground/50" />
              <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                Nenhuma imagem encontrada
              </h2>
              <p className="mt-2 text-muted-foreground">
                 Tente um filtro diferente ou limpe a seleção.
              </p>
            </div>
          ) : renderContent()}
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

      {brandDetails && selectedBrand && (
        <BrandDetailsDialog
            isOpen={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            brand={selectedBrand}
            details={brandDetails}
            onImageClick={(id) => setSelectedImage(id)}
        />
      )}
    </div>
  );
}


export default function Home() {
  return (
    // You could have a loading skeleton here while waiting for the suspense
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  )
}
