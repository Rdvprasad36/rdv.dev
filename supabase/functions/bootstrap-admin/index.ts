// Bootstrap the very first admin: if no admin exists yet, grant the supplied user_id the admin role.
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user_id } = await req.json();
    if (!user_id || typeof user_id !== "string") {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check whether any admin already exists
    const { count, error: countError } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) throw countError;

    if ((count ?? 0) > 0) {
      return new Response(
        JSON.stringify({ error: "An admin already exists. Bootstrap is locked." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id, role: "admin" });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
