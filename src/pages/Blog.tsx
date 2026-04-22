import { Section } from "@/components/Section";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useState, useEffect } from "react";
import { PostFormDialog } from "@/components/admin/PostFormDialog";
import { toast } from "sonner";
import { getVisitorId } from "@/lib/visitorId";
import profileDefault from "@/assets/profile-default.jpg";
import { formatDistanceToNow } from "date-fns";

export default function Blog() {
  const { isAdmin } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const visitorId = getVisitorId();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("visitor_id", visitorId);
      setLikedIds(new Set((data ?? []).map((r) => r.post_id)));
    })();
  }, [visitorId]);

  async function toggleLike(postId: string) {
    const liked = likedIds.has(postId);
    // Optimistic
    setLikedIds((prev) => {
      const next = new Set(prev);
      liked ? next.delete(postId) : next.add(postId);
      return next;
    });
    queryClient.setQueryData(["posts"], (old: any[] = []) =>
      old.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count + (liked ? -1 : 1) } : p))
    );
    if (liked) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("visitor_id", visitorId);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, visitor_id: visitorId });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Post deleted");
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  }

  return (
    <Section eyebrow="Updates" title="Blog" description="Short-form notes, project updates and learnings.">
      {isAdmin && (
        <div className="mb-6">
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New post
          </Button>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-5">
        {isLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}

        {!isLoading && posts.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No posts yet. {isAdmin && "Click 'New post' to share an update."}</p>
          </Card>
        )}

        {posts.map((p: any, i: number) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <Card className="overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={profile?.profile_pic_url || profileDefault}
                    alt={profile?.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{profile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.tagline} · {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed mb-3">{p.content}</p>
              </div>
              {p.image_url && (
                <img src={p.image_url} alt="Post" loading="lazy" className="w-full max-h-[500px] object-cover" />
              )}
              <div className="px-5 py-3 border-t border-border/40 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(p.id)}
                  className={likedIds.has(p.id) ? "text-primary" : ""}
                >
                  <Heart className={`h-4 w-4 mr-1.5 ${likedIds.has(p.id) ? "fill-current" : ""}`} />
                  {p.likes_count} {p.likes_count === 1 ? "like" : "likes"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <PostFormDialog open={open} onOpenChange={setOpen} post={editing} />
    </Section>
  );
}
