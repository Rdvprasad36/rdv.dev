import { Github, Linkedin, Twitter } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

export function Footer() {
  const { data: profile } = useProfile();
  return (
    <footer className="border-t border-border/40 mt-24">
      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profile?.name ?? "RDV.Dev"} — Built with React & Lovable Cloud.
        </p>
        <div className="flex items-center gap-2">
          {profile?.github_url && (
            <a href={profile.github_url} target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-secondary transition-colors" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </a>
          )}
          {profile?.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-secondary transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {profile?.twitter_url && (
            <a href={profile.twitter_url} target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-secondary transition-colors" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
