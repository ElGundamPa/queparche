import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

export type GeoPoint = { latitude: number; longitude: number };
export type LocationState = {
  coords: GeoPoint | null;
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'error';
  error?: string;
};

export function haversineDistanceMeters(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c = 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon));
  return R * c;
}

export default function useLocation() {
  const [state, setState] = useState<LocationState>({ coords: null, status: 'idle' });

  useEffect(() => {
    let isMounted = true;
    async function getNative() {
      try {
        setState((s) => ({ ...s, status: 'requesting' }));
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!isMounted) return;
          setState({ coords: null, status: 'denied' });
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        if (!isMounted) return;
        setState({
          coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          status: 'granted',
        });
      } catch (e) {
        if (!isMounted) return;
        setState({ coords: null, status: 'error', error: (e as Error).message });
      }
    }

    function getWeb() {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        setState((s) => ({ ...s, status: 'requesting' }));
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!isMounted) return;
            setState({
              coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
              status: 'granted',
            });
          },
          (err) => {
            if (!isMounted) return;
            setState({ coords: null, status: 'denied', error: err.message });
          },
          { enableHighAccuracy: false, maximumAge: 60000, timeout: 8000 }
        );
      } else {
        setState({ coords: null, status: 'denied' });
      }
    }

    if (Platform.OS === 'web') getWeb();
    else getNative();

    return () => {
      isMounted = false;
    };
  }, []);

  const helpers = useMemo(() => ({
    distanceFrom(point?: GeoPoint | null) {
      if (!state.coords || !point) return null;
      return haversineDistanceMeters(state.coords, point);
    },
  }), [state.coords]);

  return { ...state, ...helpers };
}
