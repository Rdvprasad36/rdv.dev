import { Section } from "@/components/Section";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Pencil, Plus, Trash2, MessageSquare, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useState, useEffect } from "react";
import { PostFormDialog } from "@/components/admin/PostFormDialog";
import { toast } from "sonner";
import { getVisitorId } from "@/lib/visitorId";
import profileDefault from "@/assets/profile-default.jpg";
import { formatDistanceToNow, format } from "date-fns";

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

  function postDate(p: any) {
    return p.post_date || p.created_at;
  }

  return (
    <Section eyebrow="Updates" title="Blog & Posts" description="Long-form articles and short updates from my journey.">
      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts"><MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Posts</TabsTrigger>
          <TabsTrigger value="blogs"><BookOpen className="h-3.5 w-3.5 mr-1.5" /> Blogs</TabsTrigger>
        </TabsList>

        {/* POSTS - mini LinkedIn masonry grid (2-3 cols, side by side) */}
        <TabsContent value="posts" className="mt-6">
          {isAdmin && (
            <div className="mb-6">
              <Button onClick={() => { setEditing(null); setOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> New post
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}
            </div>
          )}

          {!isLoading && posts.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No posts yet. {isAdmin && "Click 'New post' to share an update."}</p>
            </Card>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
            {(posts as any[]).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
              >
                <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <img
                        src={profile?.profile_pic_url || profileDefault}
                        alt={profile?.name}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{profile?.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {format(new Date(postDate(p)), "MMM d, yyyy")} · {formatDistanceToNow(new Date(postDate(p)), { addSuffix: true })}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(p); setOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">{p.content}</p>
                  </div>
                  {(() => {
                    const imgs: string[] = (Array.isArray(p.image_urls) && p.image_urls.length)
                      ? p.image_urls
                      : p.image_url ? [p.image_url] : [];
                    if (imgs.length === 0) return null;
                    if (imgs.length === 1) {
                      return <img src={imgs[0]} alt="Post" loading="lazy" className="w-full max-h-64 object-cover" />;
                    }
                    return (
                      <div className={`grid gap-0.5 ${imgs.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
                        {imgs.slice(0, 4).map((src, i) => (
                          <div
                            key={i}
                            className={`relative ${imgs.length === 3 && i === 0 ? "col-span-2" : ""}`}
                          >
                            <img
                              src={src}
                              alt={`Post image ${i + 1}`}
                              loading="lazy"
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="mt-auto px-4 py-2 border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(p.id)}
                      className={`h-8 ${likedIds.has(p.id) ? "text-primary" : ""}`}
                    >
                      <Heart className={`h-4 w-4 mr-1.5 ${likedIds.has(p.id) ? "fill-current" : ""}`} />
                      {p.likes_count} {p.likes_count === 1 ? "like" : "likes"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* BLOGS - placeholder section */}
        <TabsContent value="blogs" className="mt-6">
          <Card className="p-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Long-form blogs coming soon</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Detailed write-ups, tutorials and deep dives will land here. For quick updates, check out the Posts tab.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <PostFormDialog open={open} onOpenChange={setOpen} post={editing} />
    </Section>
  );
}
