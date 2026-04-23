import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project: any | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    image_url: "",
    repo_url: "",
    live_url: "",
    tech_stack: "",
    timeline: "",
    featured: false,
    is_deployed: false,
    deploy_url: "",
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        ...project,
        tech_stack: (project.tech_stack ?? []).join(", "),
      });
    } else {
      setForm({ title: "", description: "", image_url: "", repo_url: "", live_url: "", tech_stack: "", timeline: "", featured: false, is_deployed: false, deploy_url: "", sort_order: 0 });
    }
  }, [project, open]);

  async function save() {
    if (!form.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      image_url: form.image_url || null,
      repo_url: form.repo_url || null,
      live_url: form.live_url || null,
      tech_stack: form.tech_stack
        ? String(form.tech_stack).split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      timeline: form.timeline || null,
      featured: !!form.featured,
      is_deployed: !!form.is_deployed,
      deploy_url: form.deploy_url || null,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = project
      ? await supabase.from("projects").update(payload).eq("id", project.id)
      : await supabase.from("projects").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(project ? "Project updated" : "Project created");
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label>Cover image</Label>
            <ImageUpload bucket="projects" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Repo URL</Label>
              <Input value={form.repo_url ?? ""} onChange={(e) => setForm({ ...form, repo_url: e.target.value })} />
            </div>
            <div>
              <Label>Live URL</Label>
              <Input value={form.live_url ?? ""} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Tech stack <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
            <Input value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, TypeScript, Postgres" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Timeline</Label>
              <Input value={form.timeline ?? ""} onChange={(e) => setForm({ ...form, timeline: e.target.value })} placeholder="2024" />
            </div>
            <div>
              <Label>Display order <span className="text-xs text-muted-foreground">(lower = first)</span></Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            </div>
          </div>

          <div className="rounded-lg border border-border p-3 space-y-3">
            <div className="flex items-center gap-3">
              <Switch checked={form.is_deployed} onCheckedChange={(v) => setForm({ ...form, is_deployed: v })} />
              <Label>Deployed / Live status</Label>
            </div>
            {form.is_deployed && (
              <div>
                <Label>Deploy URL</Label>
                <Input
                  value={form.deploy_url ?? ""}
                  onChange={(e) => setForm({ ...form, deploy_url: e.target.value })}
                  placeholder="https://yourapp.vercel.app"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            <Label>Featured project</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
