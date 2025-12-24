// frontend/lib/auth.ts
import { supabase } from "./supabaseClient";

export async function getInstitutionId() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("institution_id")
    .eq("id", user.id)
    .single();

  return data?.institution_id;
}
