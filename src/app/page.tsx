'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { FileImage, Upload } from 'lucide-react';
import Header from '@/components/header';
import { ImageUploadDialog } from '@/components/image-upload-dialog';
import ImageCard from '@/components/image-card';
import type { StoredImage } from '@/types';

// Mock initial data
const initialImages: StoredImage[] = [
  { id: '1', src: 'https://picsum.photos/seed/img1/600/400', category: 'landscape', alt: 'A person standing on a rock looking at a mountain range.', hint: 'mountain landscape' },
  { id: '2', src: 'https://picsum.photos/seed/img2/600/400', category: 'animal', alt: 'A close-up of a brightly colored macaw.', hint: 'animal bird' },
  { id: '3', src: 'https://picsum.photos/seed/img3/600/400', category: 'cityscape', alt: 'A modern city skyline at night with lights reflecting on water.', hint: 'city night' },
  { id: '4', src: 'https://picsum.photos/seed/img4/600/400', category: 'food', alt: 'A plate of delicious looking pasta.', hint: 'food pasta' },
  { id: '5', src: 'https://picsum.photos/seed/img5/600/400', category: 'abstract', alt: 'An abstract painting with swirls of blue and gold.', hint: 'abstract art' },
  { id: '6', src: 'https://picsum.photos/seed/img6/600/400', category: 'vehicle', alt: 'A vintage car parked on a cobblestone street.', hint: 'vintage car' },
  { id: '7', src: 'https://picsum.photos/seed/img7/600/400', category: 'portrait', alt: 'A person smiling at the camera.', hint: 'person portrait' },
  { id: '8', src: 'https://picsum.photos/seed/img8/600/400', category: 'technology', alt: 'A person typing on a laptop.', hint: 'laptop computer' },
];

export default function Home() {
  const [images, setImages] = useState<StoredImage[]>(initialImages);
  const [searchQuery, setSearchQuery] = useState('');

  const handleImagesUploaded = (uploadedImages: StoredImage[]) => {
    setImages((prevImages) => [...uploadedImages, ...prevImages]);
  };

  const filteredImages = useMemo(() => {
    if (!searchQuery) return images;
    return images.filter((image) =>
      image.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [images, searchQuery]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
        <ImageUploadDialog onImagesUploaded={handleImagesUploaded}>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </Button>
        </ImageUploadDialog>
      </Header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
                No Images Found
              </h2>
              <p className="mt-2 text-muted-foreground">
                {searchQuery
                  ? "Try a different search term or clear your search."
                  : "Get started by uploading your first image."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
