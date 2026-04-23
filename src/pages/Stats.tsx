import { Section } from "@/components/Section";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Github,
  Code2,
  Trophy,
  Activity,
  Flame,
  ChefHat,
  CalendarDays,
  Tag,
} from "lucide-react";

export default function Stats() {
  const { data: profile } = useProfile();

  // Try to derive a CodeChef username from URL or fallback fields
  const codechefUsername =
    profile?.codechef_url?.match(/codechef\.com\/users\/([^/?#]+)/i)?.[1] ?? null;

  const { data: githubStats, isLoading: ghLoading } = useQuery({
    queryKey: ["github-stats", profile?.github_username],
    enabled: !!profile?.github_username,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("github-stats", {
        body: { username: profile!.github_username },
      });
      if (error) throw error;
      return data;
    },
  });

  const { data: leetcodeStats, isLoading: lcLoading } = useQuery({
    queryKey: ["leetcode-stats", profile?.leetcode_username],
    enabled: !!profile?.leetcode_username,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("leetcode-stats", {
        body: { username: profile!.leetcode_username },
      });
      if (error) throw error;
      return data;
    },
  });

  const { data: codechefStats, isLoading: ccLoading } = useQuery({
    queryKey: ["codechef-stats", codechefUsername],
    enabled: !!codechefUsername,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("codechef-stats", {
        body: { username: codechefUsername },
      });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Section eyebrow="Activity" title="Coding Stats" description="Live data from my GitHub, LeetCode and CodeChef profiles.">
      {/* ============= GITHUB AREA — everything in one block ============= */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Github className="h-5 w-5" />
          <h3 className="font-semibold">GitHub</h3>
          {profile?.github_username && (
            <a
              href={`https://github.com/${profile.github_username}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              @{profile.github_username}
            </a>
          )}
        </div>

        {!profile?.github_username ? (
          <p className="text-sm text-muted-foreground">Add a GitHub username in admin to see stats.</p>
        ) : ghLoading ? (
          <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-24" /></div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <Stat icon={<Code2 className="h-4 w-4" />} label="Repos" value={githubStats?.public_repos ?? "—"} />
              <Stat icon={<Activity className="h-4 w-4" />} label="Followers" value={githubStats?.followers ?? "—"} />
              <Stat icon={<Trophy className="h-4 w-4" />} label="Following" value={githubStats?.following ?? "—"} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Contribution graph
              </p>
              <img
                src={`https://ghchart.rshah.org/${profile.github_username}`}
                alt="GitHub contributions"
                loading="lazy"
                className="w-full rounded-md"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 inline-flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-500" /> Streak
              </p>
              <div className="flex justify-center overflow-x-auto">
                <img
                  src={`https://github-readme-streak-stats.herokuapp.com/?user=${encodeURIComponent(profile.github_username)}&theme=transparent&hide_border=true&background=00000000&ring=2563EB&fire=F97316&currStreakLabel=2563EB`}
                  alt={`GitHub streak for ${profile.github_username}`}
                  loading="lazy"
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Top languages</p>
                <img
                  src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${encodeURIComponent(profile.github_username)}&layout=compact&theme=transparent&hide_border=true&bg_color=00000000&title_color=2563EB&text_color=888`}
                  alt="Top languages"
                  loading="lazy"
                  className="w-full"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Stats card</p>
                <img
                  src={`https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(profile.github_username)}&show_icons=true&theme=transparent&hide_border=true&bg_color=00000000&title_color=2563EB&icon_color=2563EB&text_color=888`}
                  alt="GitHub stats card"
                  loading="lazy"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ============= LEETCODE + CODECHEF row ============= */}
      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        {/* LeetCode */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">LeetCode</h3>
            {profile?.leetcode_username && (
              <a
                href={`https://leetcode.com/u/${profile.leetcode_username}/`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                @{profile.leetcode_username}
              </a>
            )}
          </div>
          {!profile?.leetcode_username ? (
            <p className="text-sm text-muted-foreground">Add a LeetCode username in admin to see stats.</p>
          ) : lcLoading ? (
            <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-24" /></div>
          ) : leetcodeStats?.error ? (
            <p className="text-sm text-muted-foreground">{leetcodeStats.error}</p>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Solved" value={leetcodeStats?.totalSolved ?? "—"} />
                <Stat label="Ranking" value={leetcodeStats?.ranking?.toLocaleString?.() ?? "—"} />
                <Stat icon={<Flame className="h-4 w-4 text-orange-500" />} label="Streak" value={leetcodeStats?.currentStreak ?? "—"} />
                <Stat label="Max streak" value={leetcodeStats?.maxStreak ?? "—"} />
              </div>

              <div className="space-y-2">
                <Bar label="Easy" solved={leetcodeStats?.easySolved} total={leetcodeStats?.totalEasy} color="bg-success" />
                <Bar label="Medium" solved={leetcodeStats?.mediumSolved} total={leetcodeStats?.totalMedium} color="bg-amber-500" />
                <Bar label="Hard" solved={leetcodeStats?.hardSolved} total={leetcodeStats?.totalHard} color="bg-destructive" />
              </div>

              {leetcodeStats?.topics?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 inline-flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Topics covered ({leetcodeStats.topics.length})
                  </p>
                  <TopicMap topics={leetcodeStats.topics} />
                </div>
              )}
            </div>
          )}
        </Card>

        {/* CodeChef */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold">CodeChef</h3>
            {codechefUsername && (
              <a
                href={`https://www.codechef.com/users/${codechefUsername}`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                @{codechefUsername}
              </a>
            )}
          </div>
          {!codechefUsername ? (
            <p className="text-sm text-muted-foreground">
              Add your CodeChef profile URL in admin (e.g. https://www.codechef.com/users/rdvprasad36) to see stats.
            </p>
          ) : ccLoading ? (
            <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-24" /></div>
          ) : codechefStats?.error ? (
            <p className="text-sm text-muted-foreground">{codechefStats.error}</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Rating" value={codechefStats?.rating ?? "—"} />
                <Stat label="Stars" value={codechefStats?.stars ?? "—"} />
                <Stat label="Global rank" value={codechefStats?.globalRank ?? "—"} />
                <Stat label="Solved" value={codechefStats?.problemsSolved ?? "—"} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Highest rating" value={codechefStats?.highestRating ?? "—"} />
                <Stat label="Contests" value={codechefStats?.contestsParticipated ?? "—"} />
              </div>
            </div>
          )}
        </Card>
      </div>
    </Section>
  );
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/50">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold truncate">{value}</p>
    </div>
  );
}

function Bar({ label, solved, total, color }: { label: string; solved?: number; total?: number; color: string }) {
  const pct = solved && total ? (solved / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{solved ?? 0} / {total ?? 0}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TopicMap({ topics }: { topics: { name: string; slug: string; count: number }[] }) {
  const max = topics[0]?.count ?? 1;
  return (
    <div className="flex flex-wrap gap-1.5">
      {topics.map((t) => {
        // size by intensity
        const intensity = t.count / max;
        const opacity = 0.25 + intensity * 0.75;
        return (
          <span
            key={t.slug}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-primary/30 text-foreground"
            style={{ backgroundColor: `hsl(var(--primary) / ${opacity * 0.25})` }}
            title={`${t.count} problems solved`}
          >
            {t.name}
            <span className="font-mono text-[10px] text-muted-foreground">{t.count}</span>
          </span>
        );
      })}
    </div>
  );
}
