import { useSyncExternalStore } from 'react';
import { getData, subscribe } from '@/services/storage';

export function useAppData() {
  const data = useSyncExternalStore(subscribe, getData, getData);
  return data;
}
