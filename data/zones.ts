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

// Preconfiguración de rutas estáticas de imágenes (temporalmente apuntan al placeholder)
// Cuando los assets locales estén disponibles, reemplaza cada constante por una importación estática
// e.g. import MedellinCover from '@/assets/images/zones/medellin/cover.jpg';
export const IMG_ZONES = {
  medellin: PLACEHOLDER_IMAGE as ImageSource,
  bello: PLACEHOLDER_IMAGE as ImageSource,
  itagui: PLACEHOLDER_IMAGE as ImageSource,
  envigado: PLACEHOLDER_IMAGE as ImageSource,
  sabaneta: PLACEHOLDER_IMAGE as ImageSource,
  'la-estrella': PLACEHOLDER_IMAGE as ImageSource,
  copacabana: PLACEHOLDER_IMAGE as ImageSource,
} as const;

export const IMG_MEDELLIN_COMUNAS = {
  popular: PLACEHOLDER_IMAGE as ImageSource,
  'santa-cruz': PLACEHOLDER_IMAGE as ImageSource,
  manrique: PLACEHOLDER_IMAGE as ImageSource,
  aranjuez: PLACEHOLDER_IMAGE as ImageSource,
  castilla: PLACEHOLDER_IMAGE as ImageSource,
  'doce-de-octubre': PLACEHOLDER_IMAGE as ImageSource,
  robledo: PLACEHOLDER_IMAGE as ImageSource,
  'villa-hermosa': PLACEHOLDER_IMAGE as ImageSource,
  'buenos-aires': PLACEHOLDER_IMAGE as ImageSource,
  'la-candelaria': PLACEHOLDER_IMAGE as ImageSource,
  'laureles-estadio': PLACEHOLDER_IMAGE as ImageSource,
  'la-america': PLACEHOLDER_IMAGE as ImageSource,
  'san-javier': PLACEHOLDER_IMAGE as ImageSource,
  'el-poblado': PLACEHOLDER_IMAGE as ImageSource,
  guayabal: PLACEHOLDER_IMAGE as ImageSource,
  belen: PLACEHOLDER_IMAGE as ImageSource,
} as const;

export const ZONES: ZoneItem[] = [
  { key: 'medellin', name: 'Medellín', image: IMG_ZONES.medellin },
  { key: 'bello', name: 'Bello', image: IMG_ZONES.bello },
  { key: 'itagui', name: 'Itagüí', image: IMG_ZONES.itagui },
  { key: 'envigado', name: 'Envigado', image: IMG_ZONES.envigado },
  { key: 'sabaneta', name: 'Sabaneta', image: IMG_ZONES.sabaneta },
  { key: 'la-estrella', name: 'La Estrella', image: IMG_ZONES['la-estrella'] },
  { key: 'copacabana', name: 'Copacabana', image: IMG_ZONES.copacabana },
];

export const MEDELLIN_COMUNAS: AreaItem[] = [
  { key: 'popular', name: 'Popular', image: IMG_MEDELLIN_COMUNAS.popular },
  { key: 'santa-cruz', name: 'Santa Cruz', image: IMG_MEDELLIN_COMUNAS['santa-cruz'] },
  { key: 'manrique', name: 'Manrique', image: IMG_MEDELLIN_COMUNAS.manrique },
  { key: 'aranjuez', name: 'Aranjuez', image: IMG_MEDELLIN_COMUNAS.aranjuez },
  { key: 'castilla', name: 'Castilla', image: IMG_MEDELLIN_COMUNAS.castilla },
  { key: 'doce-de-octubre', name: 'Doce de Octubre', image: IMG_MEDELLIN_COMUNAS['doce-de-octubre'] },
  { key: 'robledo', name: 'Robledo', image: IMG_MEDELLIN_COMUNAS.robledo },
  { key: 'villa-hermosa', name: 'Villa Hermosa', image: IMG_MEDELLIN_COMUNAS['villa-hermosa'] },
  { key: 'buenos-aires', name: 'Buenos Aires', image: IMG_MEDELLIN_COMUNAS['buenos-aires'] },
  { key: 'la-candelaria', name: 'La Candelaria', image: IMG_MEDELLIN_COMUNAS['la-candelaria'] },
  { key: 'laureles-estadio', name: 'Laureles–Estadio', image: IMG_MEDELLIN_COMUNAS['laureles-estadio'] },
  { key: 'la-america', name: 'La América', image: IMG_MEDELLIN_COMUNAS['la-america'] },
  { key: 'san-javier', name: 'San Javier', image: IMG_MEDELLIN_COMUNAS['san-javier'] },
  { key: 'el-poblado', name: 'El Poblado', image: IMG_MEDELLIN_COMUNAS['el-poblado'] },
  { key: 'guayabal', name: 'Guayabal', image: IMG_MEDELLIN_COMUNAS.guayabal },
  { key: 'belen', name: 'Belén', image: IMG_MEDELLIN_COMUNAS.belen },
];