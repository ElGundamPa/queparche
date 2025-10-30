export const colors = {
  background: '#0E0E0E',
  surface: '#1A1A1A',
  primary: '#FF3B30',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  border: '#2A2A2A',
  overlay: 'rgba(0,0,0,0.5)',
  softOverlay: 'rgba(0,0,0,0.3)',
} as const;

export const spacing = {
  horizontal: 20,
  vertical: 12,
  section: 24,
  lg: 16,
  md: 12,
  sm: 8,
  xs: 6,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  button: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
} as const;

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  typography,
} as const;

export default theme;


