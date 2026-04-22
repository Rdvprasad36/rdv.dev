import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  name: string;
  tagline: string | null;
  bio: string | null;
  email: string | null;
  location: string | null;
  profile_pic_url: string | null;
  resume_url: string | null;
  is_available: boolean;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  github_username: string | null;
  leetcode_username: string | null;
};

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}
