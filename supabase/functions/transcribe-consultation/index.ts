// Transcribe + summarise a recorded doctor consultation (Gemini native API, audio input).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function callGemini(key: string, mime: string, audioBase64: string, prompt: string) {
  return await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mime, data: audioBase64 } },
            { text: prompt },
          ],
        }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { audioBase64, mime = "audio/webm", loveeName, illnessType, illnessStage } =
      await req.json().catch(() => ({}));
    if (!audioBase64 || typeof audioBase64 !== "string") {
      return json({ error: "Missing audioBase64" }, 400);
    }
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

    const who = loveeName || "their loved one";
    const condition = [illnessType, illnessStage].filter(Boolean).join(", ");
    const prompt = `This audio is a doctor consultation recorded by a family caregiver in Singapore about ${who}${condition ? ` (${condition})` : ""}.
Transcribe and summarise it. Return STRICT JSON only:
{"transcript":"...","summary":"...","action_steps":["..."]}
Rules:
- transcript: clean verbatim transcription. Label speakers "Doctor:" / "Family:" where distinguishable. Keep Singlish, Mandarin or dialect phrases as spoken, with a short English gloss in parentheses.
- summary: 3-5 warm, plain-English sentences a family member can read at a glance - what was discussed, any changes in condition, any medication or treatment changes. No jargon.
- action_steps: concrete next actions mentioned or implied (appointments to book, medication changes, symptoms to monitor, documents to bring). 3-7 short items. Empty array if none.
If the audio is silent or unintelligible, return {"transcript":"","summary":"We couldn't make out this recording clearly.","action_steps":[]}.`;

    let res = await callGemini(GEMINI_API_KEY, mime, audioBase64, prompt);
    // Chrome records audio/webm (opus), which Gemini sometimes rejects; ogg carries the same codec.
    if (!res.ok && res.status < 500 && mime.startsWith("audio/webm")) {
      res = await callGemini(GEMINI_API_KEY, "audio/ogg", audioBase64, prompt);
    }
    if (!res.ok) {
      const detail = await res.text();
      return json({ error: "AI transcription error", detail }, 502);
    }

    const data = await res.json();
    const content: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    let parsed: { transcript?: string; summary?: string; action_steps?: string[] } = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    return json({
      transcript: parsed.transcript ?? "",
      summary: parsed.summary ?? "",
      actionSteps: (parsed.action_steps ?? []).filter((s) => typeof s === "string" && s.trim()),
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
