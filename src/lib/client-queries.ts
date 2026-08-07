import { supabase } from "@/integrations/supabase/client";

export async function fetchMyCodes() {
  const { data, error } = await supabase
    .from("qr_codes")
    .select("*")
    .order("favorite", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
