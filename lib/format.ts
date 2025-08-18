import { Platform } from 'react-native';

export function formatCOP(value: number | null | undefined): string {
  if (value == null) return 'Gratis';
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  } catch (_e) {
    return `COP ${Math.round(value).toLocaleString('es-CO')}`;
  }
}

export function formatDistanceKm(meters?: number | null): string {
  if (meters == null) return '';
  const km = meters / 1000;
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

export function formatDateTimeCO(dateInput: string | number | Date): string {
  const d = new Date(dateInput);
  try {
    const formatter = new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return formatter.format(d).replace(',', ' ·');
  } catch (_e) {
    return d.toLocaleString('es-CO');
  }
}

export function platformSupportsHover(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof window !== 'undefined') {
    // @ts-ignore: web-only API
    return window.matchMedia && window.matchMedia('(hover: hover)').matches;
  }
  return false;
}
