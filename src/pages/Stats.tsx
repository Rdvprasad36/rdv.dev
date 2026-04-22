import { Section } from "@/components/Section";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Github, Code2, Trophy, Activity } from "lucide-react";

export default function Stats() {
  const { data: profile } = useProfile();

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

  return (
    <Section eyebrow="Activity" title="Coding Stats" description="Live data from my GitHub and LeetCode profiles.">
      <div className="grid md:grid-cols-2 gap-5">
        {/* GitHub */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
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
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Stat icon={<Code2 className="h-4 w-4" />} label="Repos" value={githubStats?.public_repos ?? "—"} />
                <Stat icon={<Activity className="h-4 w-4" />} label="Followers" value={githubStats?.followers ?? "—"} />
                <Stat icon={<Trophy className="h-4 w-4" />} label="Following" value={githubStats?.following ?? "—"} />
              </div>
              {profile.github_username && (
                <img
                  src={`https://ghchart.rshah.org/${profile.github_username}`}
                  alt="GitHub contributions"
                  loading="lazy"
                  className="w-full rounded-md"
                />
              )}
            </div>
          )}
        </Card>

        {/* LeetCode */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">LeetCode</h3>
            {profile?.leetcode_username && (
              <a
                href={`https://leetcode.com/${profile.leetcode_username}`}
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Total Solved" value={leetcodeStats?.totalSolved ?? "—"} />
                <Stat label="Ranking" value={leetcodeStats?.ranking ?? "—"} />
              </div>
              <div className="space-y-2">
                <Bar label="Easy" solved={leetcodeStats?.easySolved} total={leetcodeStats?.totalEasy} color="bg-success" />
                <Bar label="Medium" solved={leetcodeStats?.mediumSolved} total={leetcodeStats?.totalMedium} color="bg-amber-500" />
                <Bar label="Hard" solved={leetcodeStats?.hardSolved} total={leetcodeStats?.totalHard} color="bg-destructive" />
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
      <p className="text-2xl font-bold">{value}</p>
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
