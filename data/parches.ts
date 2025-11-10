import { Plan } from '@/types/plan';

const titles = [
  'Live Music Night',
  'Rooftop Drinks',
  'Food Truck Rally',
  'Free Walking Tour',
  'Art & Culture Fair',
  'Nature Hike',
  'Nightlife Meetup',
  'Sports & Friends',
] as const;

const tagsPool = ['Hoy', 'Destacado', 'Nuevo', 'Top'] as const;

const priceLabels = ['Free', '$20k', '$25k', '$30k', '$45k', '$65k'] as const;

const timeLabels = ['Hoy 6:00 pm', 'Hoy 7:00 pm', 'Sábado 3:00 pm', 'Domingo 10:00 am', 'Viernes 8:00 pm'] as const;

const imagePools = {
  food: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91',
  ],
  music: [
    'https://images.unsplash.com/photo-1532634922-8fe0b757fb13',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    'https://images.unsplash.com/photo-1514512364185-4c2b1c5a1f2e',
  ],
  outdoors: [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    'https://images.unsplash.com/photo-1512428559087-560fa5ceab42',
  ],
} as const;

function priceToNumber(label: typeof priceLabels[number]): number {
  if (label === 'Free') return 0;
  const numeric = Number(label.replace(/[^0-9]/g, '')) * 1000;
  return Number.isFinite(numeric) ? numeric : 0;
}

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function imageForIndex(i: number): string {
  const all = [...imagePools.food, ...imagePools.music, ...imagePools.outdoors];
  return pick(all, i);
}

let uid = 0;
function id(prefix: string) {
  uid += 1;
  return `${prefix}_${uid}`;
}

function makePlan(base: { name: string; area: string; idx: number; category?: string }): Plan {
  const priceLabel = pick(priceLabels, base.idx);
  const price = priceToNumber(priceLabel);
  const tag = pick(tagsPool, base.idx);
  const when = pick(timeLabels, base.idx);
  const images = [imageForIndex(base.idx)];
  const capacity = 50 + (base.idx % 6) * 10;
  const currentAttendees = Math.min(capacity - 5, 12 + (base.idx % 12) * 3);
  const eventStart = new Date(Date.now() + (base.idx % 14 + 1) * 24 * 60 * 60 * 1000);
  const categories = [
    tag.toLowerCase(),
    'plan urbano',
  ];

  return {
    id: id(`plan_${base.area}`),
    name: `${base.name} · ${base.area}`,
    location: { latitude: 6.2442, longitude: -75.5812, address: `${base.area}, Medellín` },
    description: `${base.name} en ${base.area}. ${when}. Etiqueta: ${tag}.`,
    capacity,
    currentAttendees,
    eventDate: eventStart.toISOString(),
    averagePrice: price,
    categories,
    category: base.category ?? 'Experiencias',
    maxPeople: 30,
    currentPeople: Math.floor((base.idx % 10) + 5),
    images,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    userId: 'system',
    likes: Math.floor(10 + (base.idx % 50)),
    favorites: Math.floor(5 + (base.idx % 20)),
    rating: 3.5 + ((base.idx % 15) / 10),
    reviewCount: Math.floor(3 + (base.idx % 40)),
    isPremium: base.idx % 7 === 0,
    isSponsored: base.idx % 11 === 0,
    price,
    priceType: price === 0 ? 'free' : 'paid',
    tags: [tag],
    endDate: new Date(eventStart.getTime() + 2 * 60 * 60 * 1000).toISOString(),
  };
}

export function generateMedellinByComuna(): Record<string, Plan[]> {
  const comunas = [
    'Popular','Santa Cruz','Manrique','Aranjuez','Castilla','Doce de Octubre','Robledo','Villa Hermosa','Buenos Aires','La Candelaria','Laureles–Estadio','La América','San Javier','El Poblado','Guayabal','Belén',
  ];
  const result: Record<string, Plan[]> = {};
  let i = 0;
  for (const comuna of comunas) {
    result[comuna] = Array.from({ length: 5 }).map((_, k) => makePlan({ name: pick(titles, i + k), area: comuna, idx: i + k }));
    i += 5;
  }
  return result;
}

export function generateFixed(zone: string, count: number): Plan[] {
  return Array.from({ length: count }).map((_, i) => makePlan({ name: pick(titles, i), area: zone, idx: i }));
}

export const plansByZone = (() => {
  const medByComuna = generateMedellinByComuna();
  const medellinAll = Object.values(medByComuna).flat();
  return {
    Medellín: medByComuna,
    Bello: generateFixed('Bello', 10),
    Itagüí: generateFixed('Itagüí', 10),
    Envigado: generateFixed('Envigado', 10),
    Sabaneta: generateFixed('Sabaneta', 10),
    'La Estrella': generateFixed('La Estrella', 10),
    Copacabana: generateFixed('Copacabana', 10),
    MedellínAll: medellinAll,
  } as const;
})();

export type ZoneKey = 'Medellín' | 'Bello' | 'Itagüí' | 'Envigado' | 'Sabaneta' | 'La Estrella' | 'Copacabana';

export const zonesList: ZoneKey[] = ['Medellín','Bello','Itagüí','Envigado','Sabaneta','La Estrella','Copacabana'];
