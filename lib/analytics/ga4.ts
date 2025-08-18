import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import * as TrackingTransparency from 'expo-tracking-transparency';

export type GA4EventParams = Record<string, string | number | boolean | null | undefined>;

const STORAGE_KEYS = {
  INSTANCE_ID: 'ga4_app_instance_id',
  CONSENT: 'ga4_consent',
};

async function getInstanceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.INSTANCE_ID);
    if (existing) return existing;
    const id = uuidv4();
    await AsyncStorage.setItem(STORAGE_KEYS.INSTANCE_ID, id);
    return id;
  } catch (e) {
    console.log('ga4:getInstanceId:error', e);
    return uuidv4();
  }
}

async function ensureConsent(): Promise<boolean> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.CONSENT);
    if (saved != null) return saved === 'granted';

    if (Platform.OS === 'ios') {
      const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
      if (status === 'undetermined') {
        const res = await TrackingTransparency.requestTrackingPermissionsAsync();
        const granted = res.status === 'granted' || (res as any).status === 'authorized';
        await AsyncStorage.setItem(STORAGE_KEYS.CONSENT, granted ? 'granted' : 'denied');
        return granted;
      }
      const granted = status === 'granted' || (status as any) === 'authorized';
      await AsyncStorage.setItem(STORAGE_KEYS.CONSENT, granted ? 'granted' : 'denied');
      return granted;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.CONSENT, 'granted');
    return true;
  } catch (e) {
    console.log('ga4:ensureConsent:error', e);
    return false;
  }
}

export type GA4Config = {
  measurementId?: string;
  apiSecret?: string;
};

let config: GA4Config = {};

export function initGA4(cfg: GA4Config) {
  config = cfg;
}

export async function track(eventName: string, params: GA4EventParams = {}) {
  try {
    if (!config.measurementId || !config.apiSecret) {
      console.log('ga4:missing_config');
      return;
    }

    const consent = await ensureConsent();
    if (!consent) return;

    const appInstanceId = await getInstanceId();
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${config.measurementId}&api_secret=${config.apiSecret}`;

    const body = {
      client_id: appInstanceId,
      events: [
        {
          name: eventName,
          params: {
            platform: Platform.OS,
            ...params,
          },
        },
      ],
    } as const;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.log('ga4:track:error', e);
  }
}

export async function resetConsent() {
  await AsyncStorage.removeItem(STORAGE_KEYS.CONSENT);
}
