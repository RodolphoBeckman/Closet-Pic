export interface StoredImage {
  id: string;
  src: string;
  category: string;
  alt: string;
  hint?: string;
  referencia?: string;
  marca?: string;
  dia?: string;
  mes?: string;
  ano?: string;
  dataRegistrada?: string;
}

export interface GroupedImage {
  groupKey: string;
  referencia: string;
  marca?: string;
  dia?: string;
  mes?: string;
  ano?: string;
  dataRegistrada?: string;
  images: {
    id: string;
    src: string;
    alt: string;
  }[];
}

export interface GalleryGroupedImage {
    marca: string;
    items: GroupedImage[];
}

export interface BaserowRow {
    'EU IA': string;
    'REFERÊNCIA'?: string;
    'MARCA'?: string;
    'DIA'?: number;
    'MES'?: string;
    'ANO'?: number;
    'DATA REGISTRADA'?: string;
    'SRC': { url: string; name: string }[];
    'ALT'?: string;
    [key: string]: any; // Allow other properties
}

export interface ChartData {
  marca: string;
  referencias: number;
}
