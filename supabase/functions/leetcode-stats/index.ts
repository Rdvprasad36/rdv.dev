const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const QUERY = `
  query userPublicProfile($username: String!, $year: Int) {
    matchedUser(username: $username) {
      profile { ranking reputation starRating }
      submitStatsGlobal { acSubmissionNum { difficulty count } }
      tagProblemCounts {
        advanced { tagName tagSlug problemsSolved }
        intermediate { tagName tagSlug problemsSolved }
        fundamental { tagName tagSlug problemsSolved }
      }
      userCalendar(year: $year) {
        streak
        totalActiveDays
        submissionCalendar
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

    const year = new Date().getUTCFullYear();
    const r = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
      body: JSON.stringify({ query: QUERY, variables: { username, year } }),
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

    // Combine tag categories
    const tagCounts = matched.tagProblemCounts ?? {};
    const allTags = [
      ...(tagCounts.advanced ?? []),
      ...(tagCounts.intermediate ?? []),
      ...(tagCounts.fundamental ?? []),
    ]
      .filter((t: any) => (t.problemsSolved ?? 0) > 0)
      .sort((a: any, b: any) => (b.problemsSolved ?? 0) - (a.problemsSolved ?? 0))
      .map((t: any) => ({ name: t.tagName, slug: t.tagSlug, count: t.problemsSolved }));

    // Streak from calendar
    let currentStreak = matched.userCalendar?.streak ?? 0;
    let totalActiveDays = matched.userCalendar?.totalActiveDays ?? 0;
    let maxStreak = 0;
    try {
      const cal = JSON.parse(matched.userCalendar?.submissionCalendar ?? "{}") as Record<string, number>;
      const days = Object.keys(cal)
        .map((k) => Number(k))
        .filter((n) => !isNaN(n) && cal[String(n)] > 0)
        .sort((a, b) => a - b);
      let run = 0;
      let prev = 0;
      for (const ts of days) {
        if (prev && ts - prev === 86400) run += 1;
        else run = 1;
        if (run > maxStreak) maxStreak = run;
        prev = ts;
      }
    } catch (_) { /* ignore */ }

    return new Response(
      JSON.stringify({
        ranking: matched.profile?.ranking ?? null,
        starRating: matched.profile?.starRating ?? null,
        totalSolved: find(ac, "All"),
        easySolved: find(ac, "Easy"),
        mediumSolved: find(ac, "Medium"),
        hardSolved: find(ac, "Hard"),
        totalEasy: find(all, "Easy"),
        totalMedium: find(all, "Medium"),
        totalHard: find(all, "Hard"),
        currentStreak,
        maxStreak,
        totalActiveDays,
        topics: allTags,
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
