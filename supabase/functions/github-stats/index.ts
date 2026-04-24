const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { username } = await req.json();
    if (!username || typeof username !== "string") {
      return new Response(JSON.stringify({ error: "username required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = Deno.env.get("GITHUB_TOKEN");
    const headers: Record<string, string> = {
      "User-Agent": "rdv-dev-portfolio",
      Accept: "application/vnd.github+json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const r = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
      { headers }
    );

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      console.error("GitHub API error", r.status, body.slice(0, 200));
      // Graceful fallback so the frontend keeps rendering the rest of the page
      return new Response(
        JSON.stringify({
          error:
            r.status === 403
              ? "GitHub API rate-limited. Add a GITHUB_TOKEN secret to lift the limit."
              : `GitHub ${r.status}`,
          fallback: true,
          public_repos: null,
          followers: null,
          following: null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await r.json();
    return new Response(
      JSON.stringify({
        public_repos: data.public_repos,
        followers: data.followers,
        following: data.following,
        avatar_url: data.avatar_url,
        html_url: data.html_url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("github-stats error", msg);
    return new Response(
      JSON.stringify({ error: msg, fallback: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
