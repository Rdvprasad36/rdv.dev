import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";

export function LogoFormDialog({
  open,
  onOpenChange,
  logo,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  logo: any | null;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    image_url: "",
    client: "",
    year: "",
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (logo) setForm(logo);
    else setForm({ title: "", description: "", image_url: "", client: "", year: "", sort_order: 0 });
  }, [logo, open]);

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
      client: form.client || null,
      year: form.year || null,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = logo
      ? await supabase.from("logos").update(payload).eq("id", logo.id)
      : await supabase.from("logos").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(logo ? "Logo updated" : "Logo added");
    queryClient.invalidateQueries({ queryKey: ["logos"] });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{logo ? "Edit logo" : "New logo"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Logo image</Label>
            <ImageUpload bucket="logos" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Client</Label>
              <Input value={form.client ?? ""} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Acme Inc." />
            </div>
            <div>
              <Label>Year</Label>
              <Input value={form.year ?? ""} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />
            </div>
          </div>
          <div>
            <Label>Display order <span className="text-xs text-muted-foreground">(lower = first)</span></Label>
            <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
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
