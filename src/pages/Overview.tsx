import { Section } from "@/components/Section";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Download,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  Github,
  Linkedin,
  Globe,
  FileText,
  Layers,
  Palette,
  Monitor,
  Plus,
  Trash2,
} from "lucide-react";
import profileDefault from "@/assets/profile-default.jpg";
import { motion } from "framer-motion";
import { InlineEdit } from "@/components/admin/InlineEdit";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Palette,
  Monitor,
  Github,
  Code2,
  Award,
  Briefcase,
  GraduationCap,
  Globe,
  FileText,
};

export default function Overview() {
  const { data: profile, isLoading } = useProfile();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  async function getMinSortOrder(table: string): Promise<number> {
    const { data } = await (supabase.from(table as any) as any)
      .select("sort_order")
      .order("sort_order", { ascending: true })
      .limit(1);
    const min = data?.[0]?.sort_order;
    return typeof min === "number" ? min - 1 : 0;
  }

  async function addOverviewSection() {
    const sort_order = await getMinSortOrder("overview_sections");
    const { error } = await supabase
      .from("overview_sections")
      .insert({ title: "New section", description: "", icon: "Layers", sort_order });
    if (error) return toast.error(error.message);
    toast.success("Card added at top");
    queryClient.invalidateQueries({ queryKey: ["overview_sections"] });
  }

  async function removeOverviewSection(id: string) {
    if (!confirm("Delete this card?")) return;
    const { error } = await supabase.from("overview_sections").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    queryClient.invalidateQueries({ queryKey: ["overview_sections"] });
  }

  async function removeRow(table: string, id: string, queryKey: string) {
    if (!confirm("Delete this entry?")) return;
    const { error } = await (supabase.from(table as any) as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  }

  /** Adds a new row at the TOP by giving it the smallest sort_order. */
  async function addRowAtTop(table: string, payload: any, queryKey: string) {
    const sort_order = await getMinSortOrder(table);
    const { error } = await (supabase.from(table as any) as any).insert({ ...payload, sort_order });
    if (error) return toast.error(error.message);
    toast.success("Added to top");
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  }


  const { data: experience = [] } = useQuery({
    queryKey: ["experience"],
    queryFn: async () => {
      const { data, error } = await supabase.from("experience").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: education = [] } = useQuery({
    queryKey: ["education"],
    queryFn: async () => {
      const { data, error } = await supabase.from("education").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: skills = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("achievements").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: overviewSections = [] } = useQuery({
    queryKey: ["overview_sections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("overview_sections").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Group skills by category
  const skillsByCategory = (skills as any[]).reduce((acc: Record<string, any[]>, s: any) => {
    const cat = s.category || "Other";
    (acc[cat] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="container py-8 space-y-6">
      {/* HERO CARD - layered like reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="relative overflow-hidden p-6 md:p-8 border-2">
          <div className="absolute inset-0 bg-gradient-hero opacity-50" />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

          {isAdmin && (
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <InlineEdit
                table="profiles"
                rowId={profile?.id ?? null}
                row={profile ?? {}}
                invalidateKeys={["profile"]}
                size="sm"
                label="Edit profile"
                fields={[
                  { key: "name", label: "Name" },
                  { key: "tagline", label: "Tagline" },
                  { key: "phone", label: "Phone", placeholder: "7382612327" },
                  { key: "email", label: "Email" },
                  { key: "location", label: "Location" },
                  { key: "portfolio_url", label: "Portfolio URL", type: "url" },
                  { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
                  { key: "github_url", label: "GitHub URL", type: "url" },
                  { key: "codechef_url", label: "CodeChef URL", type: "url" },
                  { key: "profile_pic_url", label: "Profile photo", type: "image" },
                  { key: "resume_url", label: "Resume PDF", type: "resume" },
                  { key: "is_available", label: "Available for work", type: "switch" },
                ]}
              />
            </div>
          )}
          <div className="relative grid md:grid-cols-[auto,1fr] gap-6 md:gap-10 items-center">
            <div className="relative mx-auto md:mx-0">
              <img
                src={profile?.profile_pic_url || profileDefault}
                alt={profile?.name || "Profile"}
                className="relative h-48 w-48 md:h-56 md:w-56 rounded-full object-cover border-4 border-background shadow-xl"
              />
              {profile?.is_available && (
                <HoverCard openDelay={80} closeDelay={120}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      aria-label="Available for new opportunities"
                      className="absolute bottom-3 right-3 h-5 w-5 rounded-full bg-success border-4 border-background animate-pulse focus:outline-none focus:ring-2 focus:ring-success/60"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent side="top" align="end" className="w-64 p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-success animate-pulse shrink-0" />
                      <div>
                        <p className="font-semibold text-success">Available for new opportunities</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Open to internships, full-time roles & freelance projects.
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>

            <div className="text-center md:text-left flex-1 min-w-0">
              {isLoading ? (
                <Skeleton className="h-12 w-72 mb-3" />
              ) : (
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
                  {profile?.name}
                </h1>
              )}
              <p className="text-base md:text-lg text-primary font-medium mb-4">
                {profile?.tagline}
              </p>

              {/* contact grid */}
              <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-2 hover:text-foreground">
                    <Phone className="h-4 w-4 text-primary" /> +91 {profile.phone}
                  </a>
                )}
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 hover:text-foreground">
                    <Mail className="h-4 w-4 text-primary" /> {profile.email}
                  </a>
                )}
                {profile?.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-foreground truncate">
                    <Globe className="h-4 w-4 text-primary" /> {profile.portfolio_url.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {profile?.location && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> {profile.location}
                  </span>
                )}
              </div>

              {/* social chip row */}
              <div className="flex flex-wrap gap-2 mb-5 justify-center md:justify-start">
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent transition-colors">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent transition-colors">
                    <Github className="h-3.5 w-3.5" /> GitHub
                  </a>
                )}
                {profile?.leetcode_username && (
                  <a href={`https://leetcode.com/u/${profile.leetcode_username}/`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent transition-colors">
                    <Code2 className="h-3.5 w-3.5" /> LeetCode
                  </a>
                )}
                {profile?.codechef_url && (
                  <a href={profile.codechef_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent transition-colors">
                    <Code2 className="h-3.5 w-3.5" /> CodeChef
                  </a>
                )}
                {profile?.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent transition-colors">
                    <Globe className="h-3.5 w-3.5" /> Portfolio
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Button asChild size="lg" variant="outline">
                  <Link to="/projects">
                    <Briefcase className="h-4 w-4 mr-2" /> View All Projects
                  </Link>
                </Button>
                {profile?.resume_url && (
                  <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-md">
                    <a href={profile.resume_url} target="_blank" rel="noreferrer" download>
                      <Download className="h-4 w-4 mr-2" /> Download Resume
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ABOUT ME card with dynamic highlight tiles */}
      {(profile?.bio || overviewSections.length > 0 || isAdmin) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">About Me</h2>
              {isAdmin && (
                <div className="ml-auto">
                  <InlineEdit
                    table="profiles"
                    rowId={profile?.id ?? null}
                    row={profile ?? {}}
                    invalidateKeys={["profile"]}
                    size="sm"
                    label="Edit bio"
                    fields={[{ key: "bio", label: "Bio", type: "textarea" }]}
                  />
                </div>
              )}
            </div>
            {profile?.bio && (
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                {profile.bio}
              </p>
            )}

            {(overviewSections.length > 0 || isAdmin) && (
              <div className="grid md:grid-cols-2 gap-5 pt-2 border-t border-border/40">
                {(overviewSections as any[]).map((sec, i) => {
                  const Icon = ICON_MAP[sec.icon || ""] || Layers;
                  return (
                    <motion.div
                      key={sec.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="relative flex gap-3 pt-5 group"
                    >
                      <div className="shrink-0 p-2.5 rounded-lg bg-primary/10 h-fit">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{sec.title}</h3>
                        {sec.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{sec.description}</p>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="absolute top-4 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <InlineEdit
                            table="overview_sections"
                            rowId={sec.id}
                            row={sec}
                            invalidateKeys={["overview_sections"]}
                            label="Edit card"
                            fields={[
                              { key: "title", label: "Title" },
                              { key: "description", label: "Description", type: "textarea" },
                              { key: "icon", label: "Icon (Layers, Palette, Monitor, Github, Code2, Award, Briefcase, GraduationCap, Globe, FileText)" },
                            ]}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeOverviewSection(sec.id)}
                            aria-label="Delete card"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {isAdmin && (
                  <button
                    onClick={addOverviewSection}
                    className="pt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add highlight card
                  </button>
                )}
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                <span className="text-muted-foreground">Ready to collaborate</span> on impactful projects and contribute to forward-thinking teams.
              </p>
              <Button asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                <Link to="/contact"><Mail className="h-4 w-4 mr-2" /> Contact Me</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* TWO-COLUMN: Experience & Skills */}
      <div className="grid lg:grid-cols-[1.6fr,1fr] gap-6">
        {/* EXPERIENCE TIMELINE — grouped by category */}
        {(experience.length > 0 || isAdmin) && (
          <div className="space-y-6">
            {(() => {
              const groups = (experience as any[]).reduce((acc: Record<string, any[]>, e: any) => {
                const cat = e.category || "Work";
                (acc[cat] ||= []).push(e);
                return acc;
              }, {});
              const order = ["Work", "Leadership & Extracurricular", ...Object.keys(groups).filter(k => k !== "Work" && k !== "Leadership & Extracurricular")];
              const sections = order.filter(k => groups[k]?.length || isAdmin);
              if (sections.length === 0) sections.push("Work");

              return sections.map((cat) => {
                const items = groups[cat] || [];
                const isLeadership = cat.toLowerCase().includes("leadership");
                return (
                  <Card key={cat} className="p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-6">
                      {isLeadership ? <Award className="h-5 w-5 text-primary" /> : <Briefcase className="h-5 w-5 text-primary" />}
                      <h2 className="text-xl font-bold">{cat}</h2>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                          onClick={() =>
                            addRowAtTop(
                              "experience",
                              { role: "New role", company: "Company", duration: "", category: cat, sort_order: 999 },
                              "experience"
                            )
                          }
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
                        </Button>
                      )}
                    </div>
                    {items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No entries yet. Click "Add" to create one.</p>
                    ) : (
                      <div className="relative pl-7 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
                        {items.map((exp: any, i: number) => (
                          <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="relative group"
                          >
                            <span className="absolute -left-[22px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                              <h3 className="font-semibold">{exp.role}</h3>
                              <span className="text-xs text-muted-foreground font-mono">{exp.duration}</span>
                            </div>
                            <p className="text-sm text-primary font-medium mb-1.5">{exp.company}</p>
                            {exp.description && <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">{exp.description}</p>}
                            {exp.tech?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {exp.tech.map((t: string) => (
                                  <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-mono">{t}</span>
                                ))}
                              </div>
                            )}
                            {isAdmin && (
                              <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <InlineEdit
                                  table="experience"
                                  rowId={exp.id}
                                  row={exp}
                                  invalidateKeys={["experience"]}
                                  label="Edit experience"
                                  fields={[
                                    { key: "role", label: "Role" },
                                    { key: "company", label: "Company" },
                                    { key: "duration", label: "Duration" },
                                    { key: "category", label: "Category (Work | Leadership & Extracurricular)" },
                                    { key: "description", label: "Description", type: "textarea" },
                                  ]}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => removeRow("experience", exp.id, "experience")}
                                  aria-label="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              });
            })()}
          </div>
        )}

        {/* SKILLS grouped */}
        {skills.length > 0 && (
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Code2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Skills</h2>
            </div>
            <div className="space-y-5">
              {(Object.entries(skillsByCategory) as [string, any[]][]).map(([cat, list]) => (
                <div key={cat}>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">{cat}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {list.map((s) => (
                      <div key={s.id} className="text-sm px-3 py-2 rounded-md border border-border bg-card hover:border-primary/40 transition-colors text-center">
                        {s.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* EDUCATION */}
      {(education.length > 0 || isAdmin) && (
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Education</h2>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() =>
                  addRowAtTop(
                    "education",
                    { institution: "New school", degree: "", field: "", duration: "", sort_order: 999 },
                    "education"
                  )
                }
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {(education as any[]).map((ed, i) => (
              <motion.div
                key={ed.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative pl-7 group before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border"
              >
                <span className="absolute left-1 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-semibold">{ed.institution}</h3>
                  <span className="text-xs text-muted-foreground font-mono">{ed.duration}</span>
                </div>
                <p className="text-sm text-primary font-medium">{ed.degree} {ed.field && `· ${ed.field}`}</p>
                {ed.description && <p className="text-sm text-muted-foreground mt-1.5">{ed.description}</p>}
                {isAdmin && (
                  <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <InlineEdit
                      table="education"
                      rowId={ed.id}
                      row={ed}
                      invalidateKeys={["education"]}
                      label="Edit education"
                      fields={[
                        { key: "institution", label: "Institution" },
                        { key: "degree", label: "Degree" },
                        { key: "field", label: "Field" },
                        { key: "duration", label: "Duration" },
                        { key: "description", label: "Description", type: "textarea" },
                      ]}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeRow("education", ed.id, "education")}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* ACHIEVEMENTS */}
      {(achievements.length > 0 || isAdmin) && (
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Achievements</h2>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() =>
                  addRowAtTop(
                    "achievements",
                    { title: "New achievement", description: "", date: "", sort_order: 999 },
                    "achievements"
                  )
                }
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
              </Button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {(achievements as any[]).map((a) => (
              <div key={a.id} className="relative group p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors">
                <h3 className="font-semibold mb-1 pr-16">{a.title}</h3>
                {a.date && <p className="text-xs text-muted-foreground font-mono mb-2">📅 {a.date}</p>}
                {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <InlineEdit
                      table="achievements"
                      rowId={a.id}
                      row={a}
                      invalidateKeys={["achievements"]}
                      label="Edit achievement"
                      fields={[
                        { key: "title", label: "Title" },
                        { key: "description", label: "Description", type: "textarea" },
                        { key: "date", label: "Date" },
                      ]}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeRow("achievements", a.id, "achievements")}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {experience.length === 0 && skills.length === 0 && education.length === 0 && (
        <Section>
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Your portfolio is ready to grow.</h3>
            <p className="text-muted-foreground mb-4">
              Sign in as admin to add your experience, skills, education and more.
            </p>
            <Button asChild>
              <a href="/auth">Sign in to get started</a>
            </Button>
          </Card>
        </Section>
      )}
    </div>
  );
}
