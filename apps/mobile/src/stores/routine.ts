import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteItem } from './favorites';

const ROUTINE_KEY = '@kozmetik_routine';

export interface RoutineStep {
  order: number;
  label: string;
  icon: string;
  product?: FavoriteItem;
}

export interface RoutineData {
  morning: RoutineStep[];
  evening: RoutineStep[];
  updatedAt: string;
}

const DEFAULT_MORNING: RoutineStep[] = [
  { order: 1, label: 'Temizleyici', icon: '🧴' },
  { order: 2, label: 'Tonik', icon: '💧' },
  { order: 3, label: 'Serum', icon: '✨' },
  { order: 4, label: 'Nemlendirici', icon: '🧊' },
  { order: 5, label: 'Güneş Kremi', icon: '☀️' },
];

const DEFAULT_EVENING: RoutineStep[] = [
  { order: 1, label: 'Temizleyici (1. adım)', icon: '🧴' },
  { order: 2, label: 'Temizleyici (2. adım)', icon: '🫧' },
  { order: 3, label: 'Aktif (Retinol/AHA/BHA)', icon: '⚡' },
  { order: 4, label: 'Nemlendirici', icon: '🧊' },
  { order: 5, label: 'Göz Kremi', icon: '👁️' },
];

export async function getRoutine(): Promise<RoutineData> {
  try {
    const raw = await AsyncStorage.getItem(ROUTINE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    morning: DEFAULT_MORNING.map((s) => ({ ...s })),
    evening: DEFAULT_EVENING.map((s) => ({ ...s })),
    updatedAt: new Date().toISOString(),
  };
}

export async function saveRoutine(data: RoutineData): Promise<void> {
  data.updatedAt = new Date().toISOString();
  await AsyncStorage.setItem(ROUTINE_KEY, JSON.stringify(data));
}

export async function clearRoutine(): Promise<void> {
  await AsyncStorage.removeItem(ROUTINE_KEY);
}
