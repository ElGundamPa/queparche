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
  image: any;
}

export interface AreaItem {
  key: string;
  name: string;
  image: any;
}

const img = (url: string) => ({ uri: url });

export const ZONES: ZoneItem[] = [
  { key: 'medellin', name: 'Medellín', image: img('https://images.unsplash.com/photo-1552083375-1447ce886485?q=80&w=1200&auto=format&fit=crop') },
  { key: 'bello', name: 'Bello', image: img('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop') },
  { key: 'itagui', name: 'Itagüí', image: img('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop') },
  { key: 'envigado', name: 'Envigado', image: img('https://images.unsplash.com/photo-1521292270410-a8c4d716d518?q=80&w=1200&auto=format&fit=crop') },
  { key: 'sabaneta', name: 'Sabaneta', image: img('https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop') },
  { key: 'la-estrella', name: 'La Estrella', image: img('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop') },
  { key: 'copacabana', name: 'Copacabana', image: img('https://images.unsplash.com/photo-1465310477141-6fb93167a273?q=80&w=1200&auto=format&fit=crop') },
];

export const MEDELLIN_COMUNAS: AreaItem[] = [
  { key: 'popular', name: 'Popular', image: img('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&auto=format&fit=crop&w=800') },
  { key: 'santa-cruz', name: 'Santa Cruz', image: img('https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&auto=format&fit=crop&w=800') },
  { key: 'manrique', name: 'Manrique', image: img('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&auto=format&fit=crop&w=800') },
  { key: 'aranjuez', name: 'Aranjuez', image: img('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&auto=format&fit=crop&w=800') },
  { key: 'castilla', name: 'Castilla', image: img('https://images.unsplash.com/photo-1521292270410-a8c4d716d518?q=80&auto=format&fit=crop&w=800') },
  { key: 'doce-de-octubre', name: 'Doce de Octubre', image: img('https://images.unsplash.com/photo-1514053026555-49ce8886ae41?q=80&auto=format&fit=crop&w=800') },
  { key: 'robledo', name: 'Robledo', image: img('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&auto=format&fit=crop&w=800') },
  { key: 'villa-hermosa', name: 'Villa Hermosa', image: img('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&auto=format&fit=crop&w=800') },
  { key: 'buenos-aires', name: 'Buenos Aires', image: img('https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&auto=format&fit=crop&w=800') },
  { key: 'la-candelaria', name: 'La Candelaria', image: img('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&auto=format&fit=crop&w=800') },
  { key: 'laureles-estadio', name: 'Laureles–Estadio', image: img('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&auto=format&fit=crop&w=800') },
  { key: 'la-america', name: 'La América', image: img('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&auto=format&fit=crop&w=800') },
  { key: 'san-javier', name: 'San Javier', image: img('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&auto=format&fit=crop&w=800') },
  { key: 'el-poblado', name: 'El Poblado', image: img('https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&auto=format&fit=crop&w=800') },
  { key: 'guayabal', name: 'Guayabal', image: img('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&auto=format&fit=crop&w=800') },
  { key: 'belen', name: 'Belén', image: img('https://images.unsplash.com/photo-1521292270410-a8c4d716d518?q=80&auto=format&fit=crop&w=800') },
];