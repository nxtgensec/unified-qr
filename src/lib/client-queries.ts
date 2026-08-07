import { supabase } from "@/integrations/supabase/client";
import { effectivePlan, type PlanId } from "./plans";

export async function fetchMyCodes() {
  const { data, error } = await supabase
    .from("qr_codes")
    .select("*")
    .order("favorite", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchMyPlan(): Promise<PlanId> {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan_tier, plan_until")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return effectivePlan(data?.plan_tier ?? null, data?.plan_until ?? null);
}
