import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

export type FiltersState = {
  zone?: string;
  comuna?: string;
  search?: string;
};

const STORAGE_KEY = 'filters_state_v1';

export const [FiltersProvider, useFilters] = createContextHook(() => {
  const [state, setState] = useState<FiltersState>({});
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as FiltersState;
          setState(parsed ?? {});
        }
      } catch (e: any) {
        console.log('[filters] load error', e?.message);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e: any) {
        console.log('[filters] save error', e?.message);
      }
    })();
  }, [state]);

  const setZone = (zone?: string) => {
    console.log('[filters] setZone', zone);
    setState((prev) => ({ ...prev, zone }));
  };
  const setComuna = (comuna?: string) => {
    console.log('[filters] setComuna', comuna);
    setState((prev) => ({ ...prev, comuna }));
  };
  const setSearch = (search?: string) => {
    console.log('[filters] setSearch', search);
    setState((prev) => ({ ...prev, search }));
  };
  const reset = () => {
    console.log('[filters] reset');
    setState({});
  };

  const hasFilters = useMemo(() => !!state.zone || !!state.comuna || !!state.search, [state.zone, state.comuna, state.search]);

  return { state, setZone, setComuna, setSearch, reset, hydrated, hasFilters };
});
