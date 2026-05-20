import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const OLD = "lidiasilvinad@gmail.com";
    const NEW = "vilaolimpica.cmvomz@gmail.com";
    const PASS = "EBENEZER2026!";

    // Find user
    let target: any = null;
    let page = 1;
    while (page < 20) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      target = data.users.find((u: any) => (u.email || "").toLowerCase() === OLD);
      if (target) break;
      if (data.users.length < 200) break;
      page++;
    }
    if (!target) return new Response(JSON.stringify({ error: "user not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { error: upErr } = await admin.auth.admin.updateUserById(target.id, {
      email: NEW,
      password: PASS,
      email_confirm: true,
    });
    if (upErr) throw upErr;

    return new Response(JSON.stringify({ success: true, id: target.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
