import { supabase } from "@/integrations/supabase/client";

/** Returns the public read-only scrapbook URL, creating the share token on first use. */
export async function getScrapbookShareUrl(userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("share_token")
    .eq("id", userId)
    .maybeSingle();
  let token = data?.share_token as string | null;
  if (!token) {
    token = crypto.randomUUID();
    await supabase.from("profiles").update({ share_token: token }).eq("id", userId);
  }
  return `${window.location.origin}/scrapbook/${token}`;
}
