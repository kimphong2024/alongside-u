import { useEffect, useState, useCallback, useRef, useSyncExternalStore } from "react";
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

const defaultLocal: LocalState = { checkedItems: {}, bucketList: [], moments: [], checkInHistory: [] };

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

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

// ============= Shared singleton store =============
type StoreSnapshot = {
  userId: string | null;
  hydrated: boolean;
  onboarding: OnboardingData;
  family: FamilyMember[];
  local: LocalState;
};

let snapshot: StoreSnapshot = {
  userId: null,
  hydrated: false,
  onboarding: {},
  family: [],
  local: defaultLocal,
};
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const getSnapshot = () => snapshot;
const getServerSnapshot = () => snapshot;
const setSnapshot = (next: Partial<StoreSnapshot>) => {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
};

let loadingForUid: string | null = null;
async function loadForUser(uid: string) {
  if (loadingForUid === uid) return;
  loadingForUid = uid;
  const [
    { data: profile },
    { data: fams },
    { data: moments },
    { data: bucket },
    { data: checkins },
    { data: checked },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
    supabase.from("family_members").select("*").eq("owner_id", uid).order("created_at", { ascending: true }),
    supabase.from("moments").select("*").eq("owner_id", uid).order("created_at", { ascending: false }),
    supabase.from("bucket_items").select("*").eq("owner_id", uid).order("created_at", { ascending: true }),
    supabase.from("check_ins").select("*").eq("owner_id", uid).order("created_at", { ascending: true }),
    supabase.from("checked_items").select("*").eq("owner_id", uid),
  ]);
  if (snapshot.userId !== uid) return;
  setSnapshot({
    hydrated: true,
    onboarding: rowToOnboarding(profile as Record<string, unknown> | null),
    family: (fams ?? []).map((f) => ({
      id: f.id, name: f.name, relationship: f.relationship ?? "Family", email: f.email ?? undefined,
    })),
    local: {
      moments: (moments ?? []).map((m) => ({
        id: m.id,
        date: m.date,
        title: m.title ?? "",
        note: m.note ?? "",
        photo: m.photo ?? undefined,
        video: m.video ?? undefined,
        audio: m.audio ?? undefined,
        audioDuration: m.audio_duration ?? undefined,
      })),
      bucketList: (bucket ?? []).map((b) => ({
        id: b.id, title: b.title, category: b.category ?? "Personal", done: !!b.done,
      })),
      checkInHistory: (checkins ?? []).map((c) => ({ date: c.date, mood: c.mood })),
      checkedItems: Object.fromEntries((checked ?? []).map((c) => [c.item_key, true])),
    },
  });
}

export function useAppData() {
  const { user, loading: authLoading } = useAuth();
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const uidRef = useRef<string | null>(null);
  uidRef.current = snap.userId;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (snapshot.userId !== null || !snapshot.hydrated) {
        loadingForUid = null;
        setSnapshot({ userId: null, hydrated: true, onboarding: {}, family: [], local: defaultLocal });
      }
      return;
    }
    if (snapshot.userId === user.id && snapshot.hydrated) return;
    if (snapshot.userId !== user.id) {
      loadingForUid = null;
      setSnapshot({ userId: user.id, hydrated: false, onboarding: {}, family: [], local: defaultLocal });
    }
    void loadForUser(user.id);
  }, [user, authLoading]);

  const saveOnboarding = useCallback(async (d: OnboardingData) => {
    if (!user) return;
    setSnapshot({ onboarding: d });
    await supabase.from("profiles").upsert({ id: user.id, ...onboardingToRow(d) });
  }, [user]);

  const addFamily = useCallback(async (m: Omit<FamilyMember, "id">) => {
    if (!user) return;
    const { data, error } = await supabase.from("family_members").insert({
      owner_id: user.id, name: m.name, relationship: m.relationship, email: m.email,
    }).select().single();
    if (!error && data) setSnapshot({
      family: [...snapshot.family, { id: data.id, name: data.name, relationship: data.relationship ?? "Family", email: data.email ?? undefined }],
    });
  }, [user]);

  const removeFamily = useCallback(async (id: string) => {
    if (!user) return;
    setSnapshot({ family: snapshot.family.filter((x) => x.id !== id) });
    await supabase.from("family_members").delete().eq("id", id);
  }, [user]);

  const syncDiff = (prev: LocalState, next: LocalState) => {
    const uid = uidRef.current;
    if (!uid) return;

    const prevM = new Map(prev.moments.map((m) => [m.id, m]));
    const nextM = new Map(next.moments.map((m) => [m.id, m]));
    next.moments.forEach((m) => {
      if (!prevM.has(m.id)) {
        void supabase.from("moments").insert({
          ...(isUuid(m.id) ? { id: m.id } : {}),
          owner_id: uid,
          date: m.date,
          title: m.title,
          note: m.note,
          photo: m.photo ?? null,
          video: m.video ?? null,
          audio: m.audio ?? null,
          audio_duration: m.audioDuration ?? null,
        });
      }
    });
    prev.moments.forEach((m) => {
      if (!nextM.has(m.id) && isUuid(m.id)) {
        void supabase.from("moments").delete().eq("id", m.id);
      }
    });

    const prevB = new Map(prev.bucketList.map((b) => [b.id, b]));
    const nextB = new Map(next.bucketList.map((b) => [b.id, b]));
    next.bucketList.forEach((b) => {
      const before = prevB.get(b.id);
      if (!before) {
        void supabase.from("bucket_items").insert({
          ...(isUuid(b.id) ? { id: b.id } : {}),
          owner_id: uid,
          title: b.title,
          category: b.category,
          done: b.done,
        });
      } else if (isUuid(b.id) && (before.done !== b.done || before.title !== b.title || before.category !== b.category)) {
        void supabase.from("bucket_items").update({
          title: b.title, category: b.category, done: b.done,
        }).eq("id", b.id);
      }
    });
    prev.bucketList.forEach((b) => {
      if (!nextB.has(b.id) && isUuid(b.id)) {
        void supabase.from("bucket_items").delete().eq("id", b.id);
      }
    });

    const prevC = new Map(prev.checkInHistory.map((c) => [c.date, c.mood]));
    const nextC = new Map(next.checkInHistory.map((c) => [c.date, c.mood]));
    nextC.forEach((mood, date) => {
      if (prevC.get(date) !== mood) {
        void (async () => {
          await supabase.from("check_ins").delete().eq("owner_id", uid).eq("date", date);
          await supabase.from("check_ins").insert({ owner_id: uid, date, mood });
        })();
      }
    });
    prevC.forEach((_, date) => {
      if (!nextC.has(date)) {
        void supabase.from("check_ins").delete().eq("owner_id", uid).eq("date", date);
      }
    });

    const keys = new Set([...Object.keys(prev.checkedItems), ...Object.keys(next.checkedItems)]);
    keys.forEach((key) => {
      const before = !!prev.checkedItems[key];
      const after = !!next.checkedItems[key];
      if (before === after) return;
      if (after) {
        void supabase.from("checked_items").upsert(
          { owner_id: uid, item_key: key },
          { onConflict: "owner_id,item_key" },
        );
      } else {
        void supabase.from("checked_items").delete().eq("owner_id", uid).eq("item_key", key);
      }
    });
  };

  const updateLocal = useCallback((updater: (s: LocalState) => LocalState) => {
    const prev = snapshot.local;
    const next = updater(prev);
    setSnapshot({ local: next });
    syncDiff(prev, next);
  }, []);

  return {
    user,
    authLoading,
    hydrated: snap.hydrated && !authLoading,
    onboarding: snap.onboarding,
    saveOnboarding,
    family: snap.family,
    addFamily,
    removeFamily,
    local: snap.local,
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
