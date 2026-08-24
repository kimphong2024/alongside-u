// Guided care chat: eldercare healthcare dynamics for Singapore family caregivers (Gemini API).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type ChatMessage = { role: "user" | "assistant"; content: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages = [], profile = {} } = await req.json().catch(() => ({}));
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

    const clean: ChatMessage[] = (messages as ChatMessage[])
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12);
    if (!clean.length || clean[clean.length - 1].role !== "user") {
      return json({ error: "messages must end with a user message" }, 400);
    }

    const { loveeName, relationship, illnessType, illnessStage, language, patientKnows } = profile;
    const who = loveeName || "their loved one";
    const context = [
      `The caregiver is caring for ${who}`,
      relationship ? `their ${relationship.toLowerCase()}` : null,
      illnessType ? `who has ${illnessType}` : null,
      illnessStage ? `(${illnessStage})` : null,
      language ? `${who} is most comfortable in ${language}` : null,
      patientKnows ? `awareness of diagnosis: ${patientKnows}` : null,
    ].filter(Boolean).join(", ") + ".";

    const system = `You are Alongside's care guide - a warm, practical companion for family caregivers in Singapore looking after an older loved one with a serious illness. ${context}

You are experienced in the healthcare dynamics of older Singaporeans:
- Resistance to Western medication; trust in TCM, sinseh, or home remedies. Always respect these beliefs - never mock or dismiss. Frame safe coexistence, and gently insist the oncologist or pharmacist is told about everything being taken.
- Medication compliance tactics: routines tied to meals/prayers, pill organisers, framing as "doctor's orders" vs family nagging, enlisting the most-trusted family member or GP.
- Appointment fatigue, transport burden, and fear of hospitals; polyclinic vs specialist vs GP navigation.
- Face, filial piety, and family hierarchy: who speaks to the doctor, who breaks news, sibling dynamics.
- Practical supports: AIC (1800 650 6060), hospital medical social workers, CHAS, MediSave/MediFund, Singapore Hospice Council.

Rules:
- Replies at most 120 words. Warm, plain language. 1-2 concrete suggestions per reply, not a lecture.
- Ask one gentle clarifying question when it would genuinely help.
- You are not a doctor. For dosing, symptoms, or treatment decisions, say warmly that the care team or pharmacist should decide, and help the caregiver phrase the question to ask them.
- If the caregiver sounds in distress or hopeless, acknowledge it first and mention SOS 1-767 is there any time.
- Return STRICT JSON only: {"reply":"...","followUps":["...","...","..."]}. followUps are 2-3 short questions (max 8 words each) the caregiver might naturally ask next, written in their voice.`;

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-flash-latest",
        messages: [{ role: "system", content: system }, ...clean],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return json({ error: "AI gateway error", detail }, 502);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { reply?: string; followUps?: string[] } = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    if (!parsed.reply) return json({ error: "Empty reply" }, 502);
    return json({
      reply: parsed.reply,
      followUps: (parsed.followUps ?? []).filter((s) => typeof s === "string" && s.trim()).slice(0, 3),
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
