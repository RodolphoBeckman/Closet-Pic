'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ScanLine, Link as LinkIcon, UploadCloud } from 'lucide-react';
import { ImageUploadDialog } from '@/components/image-upload-dialog';
import { StoredImage } from '@/types';

export default function Home() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImagesUploaded = (uploadedImages: StoredImage[]) => {
    const imagesParam = encodeURIComponent(JSON.stringify(uploadedImages));
    router.push(`/gallery?images=${imagesParam}`);
  };

  const handlePaste = async () => {
    try {
      const permission = await navigator.permissions.query({
        name: 'clipboard-read' as any,
      });
      if (permission.state === 'denied') {
        throw new Error('Not allowed to read clipboard.');
      }
      const clipboardContents = await navigator.clipboard.read();
      const imageItem = clipboardContents.find((item) =>
        item.types.some((type) => type.startsWith('image/'))
      );

      if (imageItem) {
        const imageType = imageItem.types.find((type) =>
          type.startsWith('image/')
        );
        const blob = await imageItem.getType(imageType!);
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          // Here you can decide what to do with the pasted image.
          // For now, let's open the dialog with this image.
          // This part needs more implementation in ImageUploadDialog to accept initial files.
          console.log('Pasted image data URL:', dataUrl);
          setIsDialogOpen(true); // Open the dialog
        };
        reader.readAsDataURL(blob);
      } else {
        // Handle case where clipboard doesn't contain an image
        alert('No image found on clipboard.');
      }
    } catch (error) {
      console.error('Failed to read clipboard contents: ', error);
      alert(
        'Failed to read clipboard. Please check permissions or try another method.'
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-background-start to-background-end">
      <header className="py-8">
        <div className="container mx-auto flex justify-center items-center gap-2">
          <Camera className="h-8 w-8 bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text drop-shadow-[0_0_0.3rem_#ffffff40]">
            ClosetPic
          </h1>
        </div>
        <p className="text-center text-muted-foreground mt-2">
          Crie conteúdo de alta qualidade para o seu e-commerce com o poder da IA.
        </p>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <ImageUploadDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onImagesUploaded={handleImagesUploaded}
          >
            <div className="bg-card/50 backdrop-blur-sm border-2 border-dashed border-primary/30 rounded-2xl p-8 sm:p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-card/60 transition-all duration-300 shadow-lg">
              <div className="flex justify-center items-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4 inline-block">
                  <ScanLine className="h-10 w-10 text-primary" />
                </div>
              </div>
              <p className="text-lg font-semibold text-foreground">
                Arraste, cole, ou{' '}
                <span className="text-primary underline">clique para escanear</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Suporta: JPG, PNG, WEBP
              </p>
            </div>
          </ImageUploadDialog>
        </div>
      </main>
      <footer className="py-8">
        <div className="container mx-auto flex items-center justify-center gap-8 text-muted-foreground">
           <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5" />
            <span>Upload de Arquivos</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer" onClick={handlePaste}>
            <LinkIcon className="h-5 w-5" />
            <span>Colar da Área de Transferência</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
