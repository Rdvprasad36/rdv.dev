import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ImageUpload } from "@/components/admin/ImageUpload";

export type EditableField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "switch" | "image" | "resume" | "url";
  placeholder?: string;
};

interface InlineEditProps {
  /** Table to update — use "profiles" for the singleton profile row */
  table: string;
  /** Row id to update; pass null for the profile singleton (will use the only row) */
  rowId?: string | null;
  /** Existing row values */
  row: Record<string, any>;
  /** Fields to expose in the dialog */
  fields: EditableField[];
  /** React-query keys to invalidate on save */
  invalidateKeys?: string[];
  /** Visual size — "icon" for tiny pencil, "sm" for labelled */
  size?: "icon" | "sm";
  className?: string;
  label?: string;
}

export function InlineEdit({
  table,
  rowId,
  row,
  fields,
  invalidateKeys = [],
  size = "icon",
  className,
  label = "Edit",
}: InlineEditProps) {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const init: Record<string, any> = {};
      fields.forEach((f) => (init[f.key] = row?.[f.key] ?? ""));
      setForm(init);
    }
  }, [open, row, fields]);

  if (!isAdmin) return null;

  async function handleSave() {
    setSaving(true);
    const payload: Record<string, any> = {};
    fields.forEach((f) => {
      const v = form[f.key];
      if (f.type === "switch") payload[f.key] = !!v;
      else payload[f.key] = v === "" ? null : v;
    });

    let q;
    if (rowId) {
      q = await (supabase.from(table as any) as any).update(payload).eq("id", rowId);
    } else {
      // singleton profile row — try update first
      const existing = (row && (row as any).id) || null;
      if (existing) {
        q = await (supabase.from(table as any) as any).update(payload).eq("id", existing);
      } else {
        q = await (supabase.from(table as any) as any).insert(payload);
      }
    }
    setSaving(false);
    if (q.error) return toast.error(q.error.message);
    toast.success("Saved");
    invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
    setOpen(false);
  }

  const trigger =
    size === "icon" ? (
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${className ?? ""}`}
        aria-label={label}
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    ) : (
      <Button variant="outline" size="sm" className={className} onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5 mr-1.5" /> {label}
      </Button>
    );

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {fields.map((f) => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    rows={4}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                ) : f.type === "switch" ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Switch
                      checked={!!form[f.key]}
                      onCheckedChange={(v) => setForm({ ...form, [f.key]: v })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {form[f.key] ? "On" : "Off"}
                    </span>
                  </div>
                ) : f.type === "image" ? (
                  <ImageUpload
                    bucket="avatars"
                    value={form[f.key]}
                    onChange={(url) => setForm({ ...form, [f.key]: url })}
                  />
                ) : f.type === "resume" ? (
                  <ImageUpload
                    bucket="resumes"
                    accept="application/pdf"
                    value={form[f.key]}
                    onChange={(url) => setForm({ ...form, [f.key]: url })}
                  />
                ) : (
                  <Input
                    type={f.type === "url" ? "url" : "text"}
                    placeholder={f.placeholder}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
