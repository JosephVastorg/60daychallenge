import { NextResponse } from "next/server";
import { createClient as createServer } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

/**
 * GDPR account deletion. Requires the signed-in user, then removes the
 * auth.users record with the service role (which cascades to all their data).
 * The service-role key is read ONLY here, server-side — never shipped to the client.
 */
export async function POST() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "Account deletion is not configured (missing SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 501 },
    );
  }

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
