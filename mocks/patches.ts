/**
 * @deprecated Este archivo está deprecado.
 * 
 * TODOS los datos de parches ahora deben usar: mockPlans de @/mocks/plans
 * 
 * Este archivo se mantiene solo para compatibilidad temporal con componentes legacy
 * como PatchCard y PatchesScreen que aún no han sido migrados.
 * 
 * Por favor, actualiza todos los componentes para usar el tipo Plan y mockPlans.
 * 
 * El tipo Plan está definido en: @/types/plan
 * Los datos están en: @/mocks/plans
 */

export interface Patch {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  description: string;
  category: string;
  image: string;
  images?: string[];
  amenities: string[];
  isFavorite?: boolean;
  latitude?: number;
  longitude?: number;
}

/**
 * @deprecated Usar mockPlans de @/mocks/plans en su lugar
 */
export const mockPatches: Patch[] = [
  {
    id: '1',
    name: 'La Taquería Urbana',
    location: 'El Poblado, Medellín',
    rating: 4.8,
    price: '$$',
    description: 'Comida mexicana moderna con ingredientes frescos y auténticos sabores. Ambiente casual y acogedor perfecto para una cena con amigos.',
    category: 'Restaurantes',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
    ],
    amenities: ['WiFi', 'Reservas', 'Terraza'],
    latitude: 6.2088,
    longitude: -75.5656,
  },
  {
    id: '2',
    name: 'Skyline Rooftop Bar',
    location: 'Laureles',
    rating: 4.9,
    price: '$$',
    description: 'Cócteles artesanales y vistas panorámicas de la ciudad. El lugar perfecto para disfrutar de un atardecer inolvidable con música en vivo.',
    category: 'Rooftops',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    images: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
    ],
    amenities: ['Música en vivo', 'Terraza', 'Vista panorámica'],
    latitude: 6.2442,
    longitude: -75.5812,
  },
  {
    id: '3',
    name: 'Picnic en el Jardín Botánico',
    location: 'Centro',
    rating: 4.6,
    price: 'Gratis',
    description: 'Disfruta de un día familiar rodeado de naturaleza. Perfecto para relajarse, hacer ejercicio o simplemente disfrutar del aire libre.',
    category: 'Planes Gratis',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    ],
    amenities: ['Aire libre', 'Familiar', 'Naturaleza'],
    latitude: 6.2442,
    longitude: -75.5812,
  },
  {
    id: '4',
    name: 'Museo de Arte Moderno MAMM',
    location: 'Ciudad del Río',
    rating: 4.7,
    price: '$$',
    description: 'Arte contemporáneo, exposiciones temporales y un café cultural único. Un espacio para la creatividad y la reflexión en el corazón de la ciudad.',
    category: 'Cultura',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    ],
    amenities: ['Exposiciones', 'Café', 'Cultura'],
    latitude: 6.2442,
    longitude: -75.5812,
  },
  {
    id: '5',
    name: 'Sendero de La Miel',
    location: 'Envigado',
    rating: 4.6,
    price: '$$',
    description: 'Caminata ecológica guiada por senderos naturales. Conecta con la naturaleza y descubre la biodiversidad de la región.',
    category: 'Naturaleza',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
    images: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    ],
    amenities: ['Ecológico', 'Guía', 'Naturaleza'],
    latitude: 6.1667,
    longitude: -75.5833,
  },
  {
    id: '6',
    name: 'Bar El Social',
    location: 'Provenza',
    rating: 4.9,
    price: '$$$',
    description: 'DJ sets exclusivos y cócteles de autor en el corazón de la vida nocturna de Medellín. El lugar perfecto para una noche inolvidable.',
    category: 'Vida Nocturna',
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
    images: [
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
    ],
    amenities: ['DJ', 'Cocteles', 'Música'],
    latitude: 6.2088,
    longitude: -75.5656,
  },
  {
    id: '7',
    name: 'Centro Comercial Santafé',
    location: 'El Poblado',
    rating: 4.5,
    price: '$$',
    description: 'El centro comercial más exclusivo de Medellín con las mejores marcas internacionales, restaurantes gourmet y entretenimiento.',
    category: 'Shopping',
    image: 'https://images.unsplash.com/photo-1555529902-1a0a2a0a0a0a?w=800',
    images: [
      'https://images.unsplash.com/photo-1555529902-1a0a2a0a0a0a?w=800',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    ],
    amenities: ['Parking', 'WiFi', 'Restaurantes'],
    latitude: 6.2088,
    longitude: -75.5656,
  },
];

