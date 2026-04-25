import { Section } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Plus, Trash2 } from "lucide-react";

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const { data: profile, refetch: refetchProfile } = useProfile();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <Section>
        <Card className="p-8 max-w-md mx-auto text-center">
          <h2 className="text-lg font-semibold mb-2">Not authorised</h2>
          <p className="text-sm text-muted-foreground">Your account does not have admin access.</p>
        </Card>
      </Section>
    );
  }

  async function saveProfile() {
    setSaving(true);
    const payload = {
      name: form.name,
      tagline: form.tagline,
      bio: form.bio,
      email: form.email,
      phone: form.phone,
      location: form.location,
      profile_pic_url: form.profile_pic_url,
      resume_url: form.resume_url,
      is_available: !!form.is_available,
      github_url: form.github_url,
      linkedin_url: form.linkedin_url,
      twitter_url: form.twitter_url,
      codechef_url: form.codechef_url,
      portfolio_url: form.portfolio_url,
      github_username: form.github_username,
      leetcode_username: form.leetcode_username,
    };
    const { error } = profile?.id
      ? await supabase.from("profiles").update(payload).eq("id", profile.id)
      : await supabase.from("profiles").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    refetchProfile();
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  return (
    <Section eyebrow="CMS" title="Admin Dashboard" description="Manage your portfolio content and read messages from visitors.">
      <Tabs defaultValue="inquiries">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="inquiries">Messages</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="overview">Overview Sections</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="p-6 space-y-4 max-w-3xl">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Tagline</Label>
                <Input value={form.tagline ?? ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea rows={3} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="7382612327" />
              </div>
            </div>
            <div className="grid sm:grid-cols-1 gap-4">
              <div>
                <Label>Location</Label>
                <Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Profile picture</Label>
                <ImageUpload bucket="avatars" value={form.profile_pic_url} onChange={(url) => setForm({ ...form, profile_pic_url: url })} />
              </div>
              <div>
                <Label>Resume PDF</Label>
                <ImageUpload bucket="resumes" accept="application/pdf" value={form.resume_url} onChange={(url) => setForm({ ...form, resume_url: url })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>GitHub URL</Label>
                <Input value={form.github_url ?? ""} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input value={form.linkedin_url ?? ""} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
              </div>
              <div>
                <Label>Twitter URL</Label>
                <Input value={form.twitter_url ?? ""} onChange={(e) => setForm({ ...form, twitter_url: e.target.value })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>CodeChef URL</Label>
                <Input value={form.codechef_url ?? ""} onChange={(e) => setForm({ ...form, codechef_url: e.target.value })} />
              </div>
              <div>
                <Label>Portfolio URL</Label>
                <Input value={form.portfolio_url ?? ""} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>GitHub username (for stats)</Label>
                <Input value={form.github_username ?? ""} onChange={(e) => setForm({ ...form, github_username: e.target.value })} />
              </div>
              <div>
                <Label>LeetCode username (for stats)</Label>
                <Input value={form.leetcode_username ?? ""} onChange={(e) => setForm({ ...form, leetcode_username: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch checked={!!form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} />
              <Label>Available for new opportunities</Label>
            </div>
            <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <SimpleListEditor
            table="overview_sections"
            queryKey="overview_sections"
            fields={[
              { key: "title", label: "Card title" },
              { key: "description", label: "Description", textarea: true },
              { key: "icon", label: "Icon (Layers, Palette, Monitor, Github, Code2, Award, Briefcase, GraduationCap, Globe, FileText)" },
              { key: "sort_order", label: "Sort", type: "number" },
            ]}
            requiredFields={["title"]}
          />
        </TabsContent>

        <TabsContent value="experience" className="mt-6">
          <SimpleListEditor
            table="experience"
            queryKey="experience"
            fields={[
              { key: "role", label: "Role" },
              { key: "company", label: "Company" },
              { key: "duration", label: "Duration" },
              { key: "description", label: "Description", textarea: true },
              { key: "tech", label: "Tech (comma-separated)", array: true },
              { key: "sort_order", label: "Sort", type: "number" },
            ]}
            requiredFields={["role", "company"]}
          />
        </TabsContent>

        <TabsContent value="education" className="mt-6">
          <SimpleListEditor
            table="education"
            queryKey="education"
            fields={[
              { key: "institution", label: "Institution" },
              { key: "degree", label: "Degree" },
              { key: "field", label: "Field" },
              { key: "duration", label: "Duration" },
              { key: "description", label: "Description", textarea: true },
              { key: "sort_order", label: "Sort", type: "number" },
            ]}
            requiredFields={["institution"]}
          />
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <SimpleListEditor
            table="skills"
            queryKey="skills"
            fields={[
              { key: "name", label: "Name" },
              { key: "category", label: "Category" },
              { key: "proficiency", label: "Proficiency 0-100", type: "number" },
              { key: "sort_order", label: "Sort", type: "number" },
            ]}
            requiredFields={["name"]}
          />
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <SimpleListEditor
            table="achievements"
            queryKey="achievements"
            fields={[
              { key: "title", label: "Title" },
              { key: "description", label: "Description", textarea: true },
              { key: "date", label: "Date" },
              { key: "sort_order", label: "Sort", type: "number" },
            ]}
            requiredFields={["title"]}
          />
        </TabsContent>

        <TabsContent value="inquiries" className="mt-6">
          <InquiriesList />
        </TabsContent>
      </Tabs>
    </Section>
  );
}

type Field = { key: string; label: string; textarea?: boolean; array?: boolean; type?: string };

function SimpleListEditor({
  table,
  queryKey,
  fields,
  requiredFields,
}: {
  table: string;
  queryKey: string;
  fields: Field[];
  requiredFields: string[];
}) {
  const queryClient = useQueryClient();
  const { data: items = [], refetch } = useQuery({
    queryKey: [queryKey, "admin"],
    queryFn: async () => {
      const { data, error } = await (supabase.from(table as any) as any).select("*").order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  const [editing, setEditing] = useState<any>(null);

  function blank() {
    const obj: any = {};
    fields.forEach((f) => (obj[f.key] = f.type === "number" ? 0 : f.array ? "" : ""));
    return obj;
  }

  async function save() {
    const payload: any = {};
    for (const f of fields) {
      const v = editing[f.key];
      if (f.array) {
        payload[f.key] = v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : [];
      } else if (f.type === "number") {
        payload[f.key] = Number(v) || 0;
      } else {
        payload[f.key] = v || null;
      }
    }
    for (const r of requiredFields) {
      if (!payload[r]) return toast.error(`${r} is required`);
    }
    const { error } = editing.id
      ? await (supabase.from(table as any) as any).update(payload).eq("id", editing.id)
      : await (supabase.from(table as any) as any).insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    refetch();
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    const { error } = await (supabase.from(table as any) as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refetch();
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  }

  function startEdit(item: any) {
    const e = { ...item };
    fields.forEach((f) => {
      if (f.array) e[f.key] = (item[f.key] ?? []).join(", ");
    });
    setEditing(e);
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setEditing(blank())}>
        <Plus className="h-4 w-4 mr-2" /> Add new
      </Button>

      <div className="grid gap-3">
        {items.map((item: any) => (
          <Card key={item.id} className="p-4 flex items-start justify-between gap-4">
            <div className="text-sm flex-1">
              <p className="font-medium">{item[fields[0].key]}</p>
              <p className="text-muted-foreground text-xs">
                {fields.slice(1, 3).map((f) => item[f.key]).filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <Card className="p-5 space-y-3 border-primary/40">
          <h3 className="font-semibold">{editing.id ? "Edit" : "New"} entry</h3>
          {fields.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              {f.textarea ? (
                <Textarea rows={3} value={editing[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />
              ) : (
                <Input
                  type={f.type ?? "text"}
                  value={editing[f.key] ?? ""}
                  onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                />
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function InquiriesList() {
  const queryClient = useQueryClient();
  const { data: items = [], refetch } = useQuery({
    queryKey: ["inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Auto-mark unread inquiries as read when admin opens the tab
  useEffect(() => {
    const unreadIds = (items as any[]).filter((i) => !i.is_read).map((i) => i.id);
    if (unreadIds.length === 0) return;
    (async () => {
      await supabase.from("inquiries").update({ is_read: true }).in("id", unreadIds);
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    })();
  }, [items, queryClient]);

  async function remove(id: string) {
    if (!confirm("Delete inquiry?")) return;
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refetch();
  }

  if (items.length === 0) {
    return <Card className="p-8 text-center text-sm text-muted-foreground">No messages yet. When visitors send a message from the Contact page it will appear here.</Card>;
  }

  return (
    <div className="space-y-3">
      {items.map((q: any) => (
        <Card key={q.id} className={`p-5 ${!q.is_read ? "border-primary/60 bg-primary/5" : ""}`}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium flex items-center gap-2">
                {!q.is_read && <span className="inline-block h-2 w-2 rounded-full bg-primary" aria-label="New" />}
                {q.name}
                <a href={`mailto:${q.email}`} className="text-muted-foreground font-normal text-sm hover:text-primary truncate">
                  · {q.email}
                </a>
              </p>
              <p className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString()}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => remove(q.id)}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
          <p className="text-sm whitespace-pre-wrap">{q.message}</p>
        </Card>
      ))}
    </div>
  );
}
