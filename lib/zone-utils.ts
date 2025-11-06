import { ZONES } from '@/data/zones';

// Función para normalizar nombres de zona (eliminar acentos, lowercase, etc.)
export const normalizeZoneName = (zoneName: string): string => {
  return zoneName.toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .trim();
};

// Función para extraer la zona desde una dirección
export const extractZoneFromAddress = (address?: string): string | null => {
  if (!address) return null;
  
  const normalizedAddress = normalizeZoneName(address);
  
  // Buscar la zona que coincida en la dirección
  for (const zone of ZONES) {
    const normalizedZoneName = normalizeZoneName(zone.name);
    if (normalizedAddress.includes(normalizedZoneName)) {
      return zone.key;
    }
  }
  
  // Si no se encuentra, intentar con las comunas de Medellín
  if (normalizedAddress.includes('medellin') || 
      normalizedAddress.includes('el poblado') || 
      normalizedAddress.includes('centro') || 
      normalizedAddress.includes('laureles') ||
      normalizedAddress.includes('provenza')) {
    return 'medellin';
  }
  
  return 'medellin'; // Default a Medellín si no se encuentra
};

// Función para extraer zona desde location string (para Patch)
export const extractZoneFromLocationString = (location: string): string => {
  const normalizedLocation = normalizeZoneName(location);
  
  for (const zone of ZONES) {
    const normalizedZoneName = normalizeZoneName(zone.name);
    if (normalizedLocation.includes(normalizedZoneName)) {
      return zone.key;
    }
  }
  
  // Si no se encuentra, intentar con las comunas de Medellín
  if (normalizedLocation.includes('medellin') || 
      normalizedLocation.includes('el poblado') || 
      normalizedLocation.includes('centro') || 
      normalizedLocation.includes('laureles') ||
      normalizedLocation.includes('provenza')) {
    return 'medellin';
  }
  
  return 'medellin'; // Default a Medellín
};

