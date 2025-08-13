import React from 'react';
import { Text, TextProps } from 'react-native';

export const H1 = (p: TextProps) => (
  <Text {...p} className={`text-text-primary font-display text-2xl leading-tight ${p.className || ''}`} />
);
export const H2 = (p: TextProps) => (
  <Text {...p} className={`text-text-primary font-semibold text-xl leading-tight ${p.className || ''}`} />
);
export const Subtitle = (p: TextProps) => (
  <Text {...p} className={`text-text-secondary font-medium text-base ${p.className || ''}`} />
);
export const Body = (p: TextProps) => (
  <Text {...p} className={`text-text-primary text-[15px] ${p.className || ''}`} />
);
export const Caption = (p: TextProps) => (
  <Text {...p} className={`text-text-muted text-xs ${p.className || ''}`} />
);
