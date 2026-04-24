import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

export function ImageUpload({
  bucket,
  value,
  onChange,
  accept = "image/*",
}: {
  bucket: "avatars" | "projects" | "posts" | "resumes";
  value?: string | null;
  onChange: (url: string) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    if (error) {
      setUploading(false);
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    toast.success("Uploaded");
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative inline-block">
          {accept.startsWith("image") ? (
            <img src={value} alt="preview" className="h-32 w-auto rounded-md border border-border object-cover" />
          ) : (
            <a href={value} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
              View current file
            </a>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="h-3.5 w-3.5 mr-2" />
          {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
        </Button>
      </div>
    </div>
  );
}
