import { Section } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Github, Linkedin, Twitter, Mail, MapPin, Send } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Valid email required").max(254),
  message: z.string().trim().min(5, "Message too short").max(5000),
});

export default function Contact() {
  const { data: profile } = useProfile();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { name, email, message } = parsed.data;
    const { error } = await supabase.from("inquiries").insert({ name, email, message });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Message sent. I'll get back to you soon!");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <Section eyebrow="Get in touch" title="Contact" description="Have a project in mind, or just want to say hi? Let's talk.">
      <div className="grid md:grid-cols-[1fr,1.2fr] gap-6 max-w-5xl">
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Reach out</h3>
            <p className="text-sm text-muted-foreground">I usually respond within 24 hours.</p>
          </div>
          {profile?.email && (
            <a href={`mailto:${profile.email}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm">{profile.email}</span>
            </a>
          )}
          {profile?.location && (
            <div className="flex items-center gap-3 p-3">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">{profile.location}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-md bg-secondary hover:bg-accent transition-colors">
                <Github className="h-4 w-4" />
              </a>
            )}
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-md bg-secondary hover:bg-accent transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {profile?.twitter_url && (
              <a href={profile.twitter_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-md bg-secondary hover:bg-accent transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={200} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={254} />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={5000} />
            </div>
            <Button type="submit" disabled={submitting} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        </Card>
      </div>
    </Section>
  );
}
