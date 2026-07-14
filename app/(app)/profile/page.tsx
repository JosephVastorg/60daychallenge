import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/ProfileClient";
import { createClient } from "@/lib/supabase/server";
import type { Badge, Notification, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: badges }, { data: notifications }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("badges").select("*").eq("user_id", user.id),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (!profile) redirect("/login");

  return (
    <ProfileClient
      profile={profile as Profile}
      badges={(badges ?? []) as Badge[]}
      notifications={(notifications ?? []) as Notification[]}
    />
  );
}
