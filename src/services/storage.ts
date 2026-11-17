// Capa de servicios de almacenamiento (localStorage)
// Diseñada para reemplazarse por una base de datos real más adelante.

import type { AppData } from '@/types';
import { buildSeedData } from './seed';

const STORAGE_KEY = 'senaconecta:data:v1';
const SESSION_KEY = 'senaconecta:session:v1';

let listeners: Array<() => void> = [];

function readRaw(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppData;
  } catch {
    return null;
  }
}

// Caché en memoria: useSyncExternalStore exige que getData devuelva
// la MISMA referencia mientras los datos no cambien. Sin esto, cada lectura
// crea un objeto nuevo y React entra en un bucle infinito (pantalla en blanco).
let cache: AppData | null = null;

function write(data: AppData): void {
  cache = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Si el navegador bloquea localStorage, la app sigue funcionando en memoria.
  }
  listeners.forEach((l) => l());
}

export function getData(): AppData {
  if (cache) return cache;
  const d = readRaw();
  if (d) {
    cache = d;
    return d;
  }
  const seed = buildSeedData();
  cache = seed;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  } catch {
    /* sin almacenamiento persistente */
  }
  return seed;
}

// Si los datos cambian en otra pestaña, se recargan aquí.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listeners.forEach((l) => l());
    }
  });
}

export function saveData(data: AppData): void {
  write(data);
}

export function resetToSeed(): AppData {
  const d = buildSeedData();
  write(d);
  return d;
}

export function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

// --- Sesión ---
export interface Session {
  userId: string;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(s: Session | null): void {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
  listeners.forEach((l) => l());
}
