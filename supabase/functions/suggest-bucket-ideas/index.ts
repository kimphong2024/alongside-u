// AI bucket-list idea suggestions for a Singaporean caregiving context (Gemini API).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { loveeName = "your loved one", existing = [] } = await req.json().catch(() => ({}));
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

    const prompt = `You are a gentle companion app for caregivers in Singapore.
Generate 8 short, meaningful bucket-list ideas a caregiver could share with ${loveeName}.
Mix categories: Experiences, Legacy, Connection, Simple Joys.
Use Singapore context where natural (kopitiam, hawker, void deck, MRT ride, botanic gardens, old neighbourhoods).
Avoid duplicates of: ${existing.slice(0, 30).join("; ") || "none"}.
Return STRICT JSON only: {"ideas":[{"title":"...","category":"Experiences|Legacy|Connection|Simple Joys"}]}.
Keep each title under 10 words, warm and concrete.`;

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail: text }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { ideas?: { title: string; category: string }[] } = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }
    const ideas = (parsed.ideas ?? []).filter((i) => i?.title).slice(0, 8);

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
