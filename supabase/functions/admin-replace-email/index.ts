import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async () => {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const out: any[] = [];
  for (let page = 1; page < 20; page++) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    for (const u of data.users) {
      const e = (u.email || "").toLowerCase();
      if (e === "lidiasilvinad@gmail.com" || e === "vilaolimpica.cmvomz@gmail.com") {
        out.push({ id: u.id, email: u.email, created_at: u.created_at });
      }
    }
    if (data.users.length < 200) break;
  }
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
});
