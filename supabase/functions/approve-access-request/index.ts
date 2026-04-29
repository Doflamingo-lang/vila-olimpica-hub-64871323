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

    // Send email with credentials
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a5d1a;">Bem-vindo à Vila Olímpica! 🏠</h2>
        <p>Olá <strong>${accessRequest.full_name}</strong>,</p>
        <p>O seu pedido de acesso à Área do Morador foi <strong>aprovado</strong>!</p>
        <p>Aqui estão as suas credenciais de acesso:</p>
        <div style="background: #f4f4f4; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Email:</strong> ${accessRequest.email}</p>
          <p style="margin: 4px 0;"><strong>Senha temporária:</strong> ${tempPassword}</p>
        </div>
        <p style="color: #c0392b;"><strong>Importante:</strong> Será obrigatório alterar a sua senha no primeiro acesso.</p>
        <p>Localização: Bloco ${accessRequest.block} · Ed. ${accessRequest.building} · Apt. ${accessRequest.apartment}</p>
        <br/>
        <p>Atenciosamente,<br/>Administração Vila Olímpica</p>
      </div>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Vila Olímpica <noreply@vilaolimp.co.mz>",
        to: [accessRequest.email],
        subject: "Acesso Aprovado - Vila Olímpica",
        html: emailHtml,
      }),
    });

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
