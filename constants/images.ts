import { type ImageSource } from 'expo-image';

export const PLACEHOLDER_IMAGE: ImageSource = {
  uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&auto=format&fit=crop&w=800'
};

export function withPlaceholder(src?: ImageSource | null): ImageSource {
  return src ?? PLACEHOLDER_IMAGE;
}
