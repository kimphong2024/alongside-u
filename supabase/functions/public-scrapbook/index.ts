// Public read-only edge function: returns a user's moments by share token.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) return json({ error: "missing token" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select("id, lovee_name, caregiver_name")
      .eq("share_token", token)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile) return json({ error: "not found" }, 404);

    const { data: moments, error: mErr } = await admin
      .from("moments")
      .select("id, date, title, note, photo, video, audio, audio_duration")
      .eq("owner_id", profile.id)
      .order("date", { ascending: false });
    if (mErr) throw mErr;

    return json({
      loveeName: profile.lovee_name ?? null,
      caregiverName: profile.caregiver_name ?? null,
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
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}
