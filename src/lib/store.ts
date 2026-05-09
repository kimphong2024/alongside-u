// Lightweight client-side state for the MVP. Persisted to localStorage.
import { useEffect, useState } from "react";

export type OnboardingData = {
  relationship?: string;
  illnessType?: string;
  illnessStage?: string;
  prognosis?: string;
  diagnosedDate?: string;
  situation?: string[];
  mobility?: string;
  communication?: string;
  language?: string;
  patientKnows?: string;
  emotional?: string;
  isPrimary?: string;
  familyHelps?: string;
  priorities?: string[];
  completed?: boolean;
  loveeName?: string;
  caregiverName?: string;
};

const KEY = "alongside_state_v1";

export type AppState = {
  onboarding: OnboardingData;
  checkedItems: Record<string, boolean>;
  bucketList: BucketItem[];
  moments: Moment[];
  family: FamilyMember[];
  checkInHistory: { date: string; mood: string }[];
};

export type BucketItem = {
  id: string;
  title: string;
  category: string;
  done: boolean;
};

export type Moment = {
  id: string;
  date: string;
  title: string;
  note: string;
};

export type FamilyMember = {
  id: string;
  name: string;
  relationship: string;
  email?: string;
};

const defaultState: AppState = {
  onboarding: {},
  checkedItems: {},
  bucketList: [],
  moments: [],
  family: [],
  checkInHistory: [],
};

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveState(s: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function useAppState() {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  const update = (updater: (s: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  };

  return { state, update, hydrated };
}
