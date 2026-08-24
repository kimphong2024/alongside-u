import { useEffect, useCallback, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Json } from "@/integrations/supabase/types";

export type ActionStep = { text: string; done: boolean };
export type ConsultationStatus = "processing" | "ready" | "failed";
export type Consultation = {
  id: string;
  date: string;
  title: string;
  audioMime?: string;
  audioDuration?: number;
  transcript?: string;
  summary?: string;
  actionSteps: ActionStep[];
  status: ConsultationStatus;
  createdAt: string;
};

export type RecordKind = "report" | "test" | "record";
export type HealthRecord = {
  id: string;
  kind: RecordKind;
  title: string;
  date: string;
  file?: string;
  mime?: string;
  note: string;
  createdAt: string;
};

type HealthSnapshot = {
  userId: string | null;
  hydrated: boolean;
  consultations: Consultation[];
  records: HealthRecord[];
};

let snapshot: HealthSnapshot = { userId: null, hydrated: false, consultations: [], records: [] };
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const getSnapshot = () => snapshot;
const setSnapshot = (next: Partial<HealthSnapshot>) => {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
};

const toActionSteps = (v: Json): ActionStep[] =>
  Array.isArray(v)
    ? v.flatMap((s) =>
        s && typeof s === "object" && !Array.isArray(s) && typeof s.text === "string"
          ? [{ text: s.text, done: !!s.done }]
          : typeof s === "string"
            ? [{ text: s, done: false }]
            : [],
      )
    : [];

// Consultation rows minus the heavy audio column — audio is fetched on demand for playback.
const CONSULTATION_COLS =
  "id,date,title,audio_mime,audio_duration,transcript,summary,action_steps,status,created_at";

type ConsultationRow = {
  id: string; date: string; title: string; audio_mime: string | null;
  audio_duration: number | null; transcript: string | null; summary: string | null;
  action_steps: Json; status: string; created_at: string;
};

const rowToConsultation = (r: ConsultationRow): Consultation => ({
  id: r.id,
  date: r.date,
  title: r.title ?? "",
  audioMime: r.audio_mime ?? undefined,
  audioDuration: r.audio_duration ?? undefined,
  transcript: r.transcript ?? undefined,
  summary: r.summary ?? undefined,
  actionSteps: toActionSteps(r.action_steps),
  status: (["processing", "ready", "failed"].includes(r.status) ? r.status : "failed") as ConsultationStatus,
  createdAt: r.created_at,
});

let loadingForUid: string | null = null;
async function loadForUser(uid: string) {
  if (loadingForUid === uid) return;
  loadingForUid = uid;
  const [{ data: cons }, { data: recs }] = await Promise.all([
    supabase.from("consultations").select(CONSULTATION_COLS).eq("owner_id", uid)
      .order("created_at", { ascending: false }),
    supabase.from("health_records").select("*").eq("owner_id", uid)
      .order("created_at", { ascending: false }),
  ]);
  if (snapshot.userId !== uid) return;
  setSnapshot({
    hydrated: true,
    consultations: ((cons ?? []) as ConsultationRow[]).map(rowToConsultation),
    records: (recs ?? []).map((r) => ({
      id: r.id,
      kind: (["report", "test", "record"].includes(r.kind) ? r.kind : "record") as RecordKind,
      title: r.title ?? "",
      date: r.date,
      file: r.file ?? undefined,
      mime: r.mime ?? undefined,
      note: r.note ?? "",
      createdAt: r.created_at,
    })),
  });
}

export async function fetchConsultationAudio(id: string): Promise<string | null> {
  const { data } = await supabase.from("consultations").select("audio").eq("id", id).maybeSingle();
  return data?.audio ?? null;
}

export function useHealthData() {
  const { user, loading: authLoading } = useAuth();
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (snapshot.userId !== null || !snapshot.hydrated) {
        loadingForUid = null;
        setSnapshot({ userId: null, hydrated: true, consultations: [], records: [] });
      }
      return;
    }
    if (snapshot.userId === user.id && snapshot.hydrated) return;
    if (snapshot.userId !== user.id) {
      loadingForUid = null;
      setSnapshot({ userId: user.id, hydrated: false, consultations: [], records: [] });
    }
    void loadForUser(user.id);
  }, [user, authLoading]);

  const addConsultation = useCallback(async (c: {
    date: string; title: string; audio: string; audioMime: string; audioDuration: number;
  }): Promise<Consultation | null> => {
    if (!user) return null;
    const { data, error } = await supabase.from("consultations").insert({
      owner_id: user.id,
      date: c.date,
      title: c.title,
      audio: c.audio,
      audio_mime: c.audioMime,
      audio_duration: c.audioDuration,
      status: "processing",
    }).select(CONSULTATION_COLS).single();
    if (error || !data) return null;
    const created = rowToConsultation(data as ConsultationRow);
    setSnapshot({ consultations: [created, ...snapshot.consultations] });
    return created;
  }, [user]);

  const updateConsultation = useCallback(async (id: string, patch: Partial<Pick<Consultation,
    "title" | "date" | "transcript" | "summary" | "actionSteps" | "status">>) => {
    setSnapshot({
      consultations: snapshot.consultations.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
    await supabase.from("consultations").update({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.date !== undefined ? { date: patch.date } : {}),
      ...(patch.transcript !== undefined ? { transcript: patch.transcript } : {}),
      ...(patch.summary !== undefined ? { summary: patch.summary } : {}),
      ...(patch.actionSteps !== undefined ? { action_steps: patch.actionSteps as unknown as Json } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    }).eq("id", id);
  }, []);

  const removeConsultation = useCallback(async (id: string) => {
    setSnapshot({ consultations: snapshot.consultations.filter((c) => c.id !== id) });
    await supabase.from("consultations").delete().eq("id", id);
  }, []);

  const addRecord = useCallback(async (r: {
    kind: RecordKind; title: string; date: string; file?: string; mime?: string; note?: string;
  }): Promise<HealthRecord | null> => {
    if (!user) return null;
    const { data, error } = await supabase.from("health_records").insert({
      owner_id: user.id,
      kind: r.kind,
      title: r.title,
      date: r.date,
      file: r.file ?? null,
      mime: r.mime ?? null,
      note: r.note ?? "",
    }).select().single();
    if (error || !data) return null;
    const created: HealthRecord = {
      id: data.id, kind: r.kind, title: data.title ?? "", date: data.date,
      file: data.file ?? undefined, mime: data.mime ?? undefined,
      note: data.note ?? "", createdAt: data.created_at,
    };
    setSnapshot({ records: [created, ...snapshot.records] });
    return created;
  }, [user]);

  const removeRecord = useCallback(async (id: string) => {
    setSnapshot({ records: snapshot.records.filter((r) => r.id !== id) });
    await supabase.from("health_records").delete().eq("id", id);
  }, []);

  return {
    user,
    hydrated: snap.hydrated && !authLoading,
    consultations: snap.consultations,
    records: snap.records,
    addConsultation,
    updateConsultation,
    removeConsultation,
    addRecord,
    removeRecord,
  };
}
