import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";

export function PostFormDialog({
  open,
  onOpenChange,
  post,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  post: any | null;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(post?.content ?? "");
    setImageUrl(post?.image_url ?? "");
  }, [post, open]);

  async function save() {
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }
    setSaving(true);
    const payload = { content: content.trim(), image_url: imageUrl || null };
    const { error } = post
      ? await supabase.from("posts").update(payload).eq("id", post.id)
      : await supabase.from("posts").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(post ? "Post updated" : "Post published");
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{post ? "Edit post" : "New post"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Content</Label>
            <Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share an update…" />
          </div>
          <div>
            <Label>Image (optional)</Label>
            <ImageUpload bucket="posts" value={imageUrl} onChange={setImageUrl} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Publish"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
