import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import { X } from "lucide-react";

const MAX_IMAGES = 4;

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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [postDate, setPostDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(post?.content ?? "");
    // Prefer image_urls array, fall back to legacy single image_url
    const urls: string[] = Array.isArray(post?.image_urls) && post.image_urls.length
      ? post.image_urls
      : post?.image_url
      ? [post.image_url]
      : [];
    setImageUrls(urls);
    const d = post?.post_date ?? post?.created_at;
    if (d) {
      const dt = new Date(d);
      const tzOffset = dt.getTimezoneOffset() * 60000;
      setPostDate(new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16));
    } else {
      setPostDate("");
    }
  }, [post, open]);

  function addImage(url: string) {
    if (!url) return;
    setImageUrls((prev) => (prev.length >= MAX_IMAGES ? prev : [...prev, url]));
  }

  function removeImage(idx: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  async function save() {
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }
    setSaving(true);
    const payload: any = {
      content: content.trim(),
      image_urls: imageUrls,
      image_url: imageUrls[0] ?? null, // keep legacy field in sync
      post_date: postDate ? new Date(postDate).toISOString() : null,
    };
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit post" : "New post"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Content</Label>
            <Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share an update…" />
          </div>
          <div>
            <Label>
              Images <span className="text-xs text-muted-foreground">({imageUrls.length}/{MAX_IMAGES})</span>
            </Label>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 my-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`upload ${idx + 1}`} className="w-full h-24 object-cover rounded-md border border-border" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {imageUrls.length < MAX_IMAGES && (
              <ImageUpload bucket="posts" value="" onChange={addImage} />
            )}
          </div>
          <div>
            <Label>Post date <span className="text-xs text-muted-foreground">(optional override)</span></Label>
            <Input type="datetime-local" value={postDate} onChange={(e) => setPostDate(e.target.value)} />
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
