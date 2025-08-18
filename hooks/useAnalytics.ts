import { useCallback } from 'react';
import { track } from '@/lib/analytics/ga4';

export default function useAnalytics() {
  const searchSubmit = useCallback((q: string) => track('search_submit', { q }), []);
  const filterToggle = useCallback((id: string, on: boolean) => track('filter_toggle', { id, on }), []);
  const eventOpen = useCallback((id: string) => track('event_open', { id }), []);
  const shareClick = useCallback((id: string) => track('share_click', { id }), []);
  const armarStart = useCallback(() => track('armar_parche_start'), []);
  const armarComplete = useCallback((choice: string) => track('armar_parche_complete', { choice }), []);
  return { searchSubmit, filterToggle, eventOpen, shareClick, armarStart, armarComplete };
}
