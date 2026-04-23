const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function pick(re: RegExp, html: string): string | null {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

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

    const r = await fetch(`https://www.codechef.com/users/${encodeURIComponent(username)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; rdv-portfolio/1.0; +https://rdv.dev)",
        Accept: "text/html",
      },
    });

    if (!r.ok) {
      return new Response(JSON.stringify({ error: `CodeChef ${r.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = await r.text();

    // Rating (current)
    const ratingStr =
      pick(/<div class="rating-number"[^>]*>(\d+)/i, html) ??
      pick(/"rating"\s*:\s*"?(\d+)"?/i, html);
    const rating = ratingStr ? parseInt(ratingStr, 10) : null;

    // Highest rating
    const highestStr = pick(/Highest Rating[^0-9]*(\d+)/i, html);
    const highestRating = highestStr ? parseInt(highestStr, 10) : null;

    // Stars
    const stars = pick(/<span class="rating"[^>]*>([^<]+)<\/span>/i, html);

    // Global / Country rank
    const globalRank = pick(/Global Rank[\s\S]*?<strong>([\d,]+)/i, html);
    const countryRank = pick(/Country Rank[\s\S]*?<strong>([\d,]+)/i, html);

    // Problems solved (fully solved problems section count)
    let problemsSolved: number | null = null;
    const psBlock = html.match(/Total Problems Solved:\s*<\/h3>\s*<h5>(\d+)/i);
    if (psBlock) problemsSolved = parseInt(psBlock[1], 10);
    if (problemsSolved === null) {
      const fallback = html.match(/Problems Solved[^0-9]{0,40}(\d+)/i);
      if (fallback) problemsSolved = parseInt(fallback[1], 10);
    }

    // Contests participated
    const contestsStr = pick(/No\. of Contest Participated[^0-9]*(\d+)/i, html);
    const contestsParticipated = contestsStr ? parseInt(contestsStr, 10) : null;

    return new Response(
      JSON.stringify({
        username,
        rating,
        highestRating,
        stars,
        globalRank: globalRank ? globalRank.replace(/,/g, "") : null,
        countryRank: countryRank ? countryRank.replace(/,/g, "") : null,
        problemsSolved,
        contestsParticipated,
        profileUrl: `https://www.codechef.com/users/${username}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
