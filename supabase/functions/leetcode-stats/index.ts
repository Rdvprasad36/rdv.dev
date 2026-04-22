const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const QUERY = `
  query userPublicProfile($username: String!) {
    matchedUser(username: $username) {
      profile { ranking }
      submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
    }
    allQuestionsCount { difficulty count }
  }
`;

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

    const r = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
    });

    if (!r.ok) {
      return new Response(JSON.stringify({ error: `LeetCode ${r.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await r.json();
    const matched = json?.data?.matchedUser;
    if (!matched) {
      return new Response(JSON.stringify({ error: "User not found on LeetCode" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ac = matched.submitStatsGlobal.acSubmissionNum as { difficulty: string; count: number }[];
    const all = json.data.allQuestionsCount as { difficulty: string; count: number }[];
    const find = (arr: any[], d: string) => arr.find((a) => a.difficulty === d)?.count ?? 0;

    return new Response(
      JSON.stringify({
        ranking: matched.profile?.ranking ?? null,
        totalSolved: find(ac, "All"),
        easySolved: find(ac, "Easy"),
        mediumSolved: find(ac, "Medium"),
        hardSolved: find(ac, "Hard"),
        totalEasy: find(all, "Easy"),
        totalMedium: find(all, "Medium"),
        totalHard: find(all, "Hard"),
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
