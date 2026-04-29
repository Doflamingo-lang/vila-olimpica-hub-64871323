import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generatePassword(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    // Verify caller is admin
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await callerClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { request_id } = await req.json();
    if (!request_id) {
      return new Response(JSON.stringify({ error: "request_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the access request
    const { data: accessRequest, error: fetchError } = await adminClient
      .from("access_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (fetchError || !accessRequest) {
      return new Response(JSON.stringify({ error: "Access request not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (accessRequest.status !== "pending") {
      return new Response(JSON.stringify({ error: "Request already processed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate temporary password
    const tempPassword = generatePassword();

    // Try to create user account, or get existing user
    let userId: string;
    let isNewUser = true;

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: accessRequest.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: accessRequest.full_name,
        block: accessRequest.block,
        building: accessRequest.building,
        apartment: accessRequest.apartment,
        resident_type: accessRequest.resident_type,
        phone: accessRequest.phone,
        must_change_password: true,
      },
    });

    if (createError) {
      // If user already exists, find them and update their password
      if (createError.message.includes("already been registered")) {
        const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
        const existingUser = users?.find((u: any) => u.email === accessRequest.email);
        
        if (!existingUser || listError) {
          return new Response(JSON.stringify({ error: "Utilizador existe mas não foi possível encontrá-lo" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update the existing user's password and metadata
        await adminClient.auth.admin.updateUserById(existingUser.id, {
          password: tempPassword,
          user_metadata: {
            full_name: accessRequest.full_name,
            block: accessRequest.block,
            building: accessRequest.building,
            apartment: accessRequest.apartment,
            resident_type: accessRequest.resident_type,
            phone: accessRequest.phone,
            must_change_password: true,
          },
        });

        userId = existingUser.id;
        isNewUser = false;
      } else {
        return new Response(JSON.stringify({ error: `Falha ao criar utilizador: ${createError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      userId = newUser.user.id;
    }

    // Assign resident role (ignore if already exists)
    await adminClient.from("user_roles").upsert({
      user_id: userId,
      role: "resident",
    }, { onConflict: "user_id,role" });

    // Update access request status
    await adminClient
      .from("access_requests")
      .update({ status: "approved" })
      .eq("id", request_id);

    // NOTA: Envio de credenciais por email foi REMOVIDO por requisito.
    // As credenciais são entregues exclusivamente via WhatsApp pelo painel admin
    // (a partir do número oficial +258 84 281 4557), usando a password gerada
    // automaticamente nesta resposta. O administrador NUNCA recebe a password.

    return new Response(
      JSON.stringify({
        success: true,
        message: "User created and email sent",
        email: accessRequest.email,
        password: tempPassword,
        full_name: accessRequest.full_name,
        whatsapp: accessRequest.whatsapp || accessRequest.phone,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
