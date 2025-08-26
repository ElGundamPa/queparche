import { type ImageSource } from 'expo-image';
import { PLACEHOLDER_IMAGE } from '@/constants/images';

export type ZoneKey =
  | 'medellin'
  | 'bello'
  | 'itagui'
  | 'envigado'
  | 'sabaneta'
  | 'la-estrella'
  | 'copacabana';

export interface ZoneItem {
  key: ZoneKey;
  name: string;
  image?: ImageSource;
}

export interface AreaItem {
  key: string;
  name: string;
  image?: ImageSource;
}

export const ZONES: ZoneItem[] = [
  { key: 'medellin', name: 'Medellín', image: PLACEHOLDER_IMAGE },
  { key: 'bello', name: 'Bello', image: PLACEHOLDER_IMAGE },
  { key: 'itagui', name: 'Itagüí', image: PLACEHOLDER_IMAGE },
  { key: 'envigado', name: 'Envigado', image: PLACEHOLDER_IMAGE },
  { key: 'sabaneta', name: 'Sabaneta', image: PLACEHOLDER_IMAGE },
  { key: 'la-estrella', name: 'La Estrella', image: PLACEHOLDER_IMAGE },
  { key: 'copacabana', name: 'Copacabana', image: PLACEHOLDER_IMAGE },
];

export const MEDELLIN_COMUNAS: AreaItem[] = [
  { key: 'popular', name: 'Popular', image: PLACEHOLDER_IMAGE },
  { key: 'santa-cruz', name: 'Santa Cruz', image: PLACEHOLDER_IMAGE },
  { key: 'manrique', name: 'Manrique', image: PLACEHOLDER_IMAGE },
  { key: 'aranjuez', name: 'Aranjuez', image: PLACEHOLDER_IMAGE },
  { key: 'castilla', name: 'Castilla', image: PLACEHOLDER_IMAGE },
  { key: 'doce-de-octubre', name: 'Doce de Octubre', image: PLACEHOLDER_IMAGE },
  { key: 'robledo', name: 'Robledo', image: PLACEHOLDER_IMAGE },
  { key: 'villa-hermosa', name: 'Villa Hermosa', image: PLACEHOLDER_IMAGE },
  { key: 'buenos-aires', name: 'Buenos Aires', image: PLACEHOLDER_IMAGE },
  { key: 'la-candelaria', name: 'La Candelaria', image: PLACEHOLDER_IMAGE },
  { key: 'laureles-estadio', name: 'Laureles–Estadio', image: PLACEHOLDER_IMAGE },
  { key: 'la-america', name: 'La América', image: PLACEHOLDER_IMAGE },
  { key: 'san-javier', name: 'San Javier', image: PLACEHOLDER_IMAGE },
  { key: 'el-poblado', name: 'El Poblado', image: PLACEHOLDER_IMAGE },
  { key: 'guayabal', name: 'Guayabal', image: PLACEHOLDER_IMAGE },
  { key: 'belen', name: 'Belén', image: PLACEHOLDER_IMAGE },
];