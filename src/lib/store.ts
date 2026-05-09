import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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

export type BucketItem = { id: string; title: string; category: string; done: boolean };
export type Moment = {
  id: string;
  date: string;
  title: string;
  note: string;
  photo?: string;
  video?: string;
  audio?: string;
  audioDuration?: number;
};
export type FamilyMember = { id: string; name: string; relationship: string; email?: string };

type LocalState = {
  checkedItems: Record<string, boolean>;
  bucketList: BucketItem[];
  moments: Moment[];
  checkInHistory: { date: string; mood: string }[];
};

const localKey = (uid: string) => `alongside_local_${uid}`;
const defaultLocal: LocalState = { checkedItems: {}, bucketList: [], moments: [], checkInHistory: [] };

function loadLocal(uid: string): LocalState {
  if (typeof window === "undefined") return defaultLocal;
  try {
    const raw = localStorage.getItem(localKey(uid));
    return raw ? { ...defaultLocal, ...JSON.parse(raw) } : defaultLocal;
  } catch { return defaultLocal; }
}
function saveLocal(uid: string, s: LocalState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(localKey(uid), JSON.stringify(s));
}

// Map db row <-> OnboardingData
function rowToOnboarding(r: Record<string, unknown> | null): OnboardingData {
  if (!r) return {};
  return {
    caregiverName: (r.caregiver_name as string) ?? undefined,
    loveeName: (r.lovee_name as string) ?? undefined,
    relationship: (r.relationship as string) ?? undefined,
    illnessType: (r.illness_type as string) ?? undefined,
    illnessStage: (r.illness_stage as string) ?? undefined,
    prognosis: (r.prognosis as string) ?? undefined,
    diagnosedDate: (r.diagnosed_date as string) ?? undefined,
    situation: (r.situation as string[]) ?? [],
    mobility: (r.mobility as string) ?? undefined,
    communication: (r.communication as string) ?? undefined,
    language: (r.language as string) ?? undefined,
    patientKnows: (r.patient_knows as string) ?? undefined,
    emotional: (r.emotional as string) ?? undefined,
    isPrimary: (r.is_primary as string) ?? undefined,
    familyHelps: (r.family_helps as string) ?? undefined,
    priorities: (r.priorities as string[]) ?? [],
    completed: (r.completed as boolean) ?? false,
  };
}

function onboardingToRow(d: OnboardingData) {
  return {
    caregiver_name: d.caregiverName ?? null,
    lovee_name: d.loveeName ?? null,
    relationship: d.relationship ?? null,
    illness_type: d.illnessType ?? null,
    illness_stage: d.illnessStage ?? null,
    prognosis: d.prognosis ?? null,
    diagnosed_date: d.diagnosedDate ?? null,
    situation: d.situation ?? [],
    mobility: d.mobility ?? null,
    communication: d.communication ?? null,
    language: d.language ?? null,
    patient_knows: d.patientKnows ?? null,
    emotional: d.emotional ?? null,
    is_primary: d.isPrimary ?? null,
    family_helps: d.familyHelps ?? null,
    priorities: d.priorities ?? [],
    completed: d.completed ?? false,
  };
}

export function useAppData() {
  const { user, loading: authLoading } = useAuth();
  const [onboarding, setOnboarding] = useState<OnboardingData>({});
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [local, setLocal] = useState<LocalState>(defaultLocal);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from cloud + local
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setHydrated(true); return; }
    let cancelled = false;
    (async () => {
      const [{ data: profile }, { data: fams }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("family_members").select("*").eq("owner_id", user.id).order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;
      setOnboarding(rowToOnboarding(profile as Record<string, unknown> | null));
      setFamily((fams ?? []).map((f) => ({
        id: f.id, name: f.name, relationship: f.relationship ?? "Family", email: f.email ?? undefined,
      })));
      setLocal(loadLocal(user.id));
      setHydrated(true);
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // Onboarding save
  const saveOnboarding = useCallback(async (d: OnboardingData) => {
    if (!user) return;
    setOnboarding(d);
    await supabase.from("profiles").upsert({ id: user.id, ...onboardingToRow(d) });
  }, [user]);

  // Family
  const addFamily = useCallback(async (m: Omit<FamilyMember, "id">) => {
    if (!user) return;
    const { data, error } = await supabase.from("family_members").insert({
      owner_id: user.id, name: m.name, relationship: m.relationship, email: m.email,
    }).select().single();
    if (!error && data) setFamily((f) => [...f, { id: data.id, name: data.name, relationship: data.relationship ?? "Family", email: data.email ?? undefined }]);
  }, [user]);

  const removeFamily = useCallback(async (id: string) => {
    if (!user) return;
    setFamily((f) => f.filter((x) => x.id !== id));
    await supabase.from("family_members").delete().eq("id", id);
  }, [user]);

  // Local-only updaters
  const updateLocal = useCallback((updater: (s: LocalState) => LocalState) => {
    if (!user) return;
    setLocal((prev) => {
      const next = updater(prev);
      saveLocal(user.id, next);
      return next;
    });
  }, [user]);

  return {
    user,
    authLoading,
    hydrated: hydrated && !authLoading,
    onboarding,
    saveOnboarding,
    family,
    addFamily,
    removeFamily,
    local,
    updateLocal,
  };
}

// Compatibility shim for legacy routes
export type AppState = LocalState & {
  onboarding: OnboardingData;
  family: FamilyMember[];
};

export function useAppState() {
  const data = useAppData();
  const state: AppState = {
    ...data.local,
    onboarding: data.onboarding,
    family: data.family,
  };
  const update = (updater: (s: AppState) => AppState) => {
    const next = updater(state);
    const prevIds = new Set(state.family.map((f) => f.id));
    const nextIds = new Set(next.family.map((f) => f.id));
    next.family.forEach((f) => {
      if (!prevIds.has(f.id)) {
        void data.addFamily({ name: f.name, relationship: f.relationship, email: f.email });
      }
    });
    state.family.forEach((f) => {
      if (!nextIds.has(f.id)) void data.removeFamily(f.id);
    });
    const { checkedItems, bucketList, moments, checkInHistory } = next;
    data.updateLocal(() => ({ checkedItems, bucketList, moments, checkInHistory }));
  };
  return { state, update, hydrated: data.hydrated };
}
