import { Section } from "@/components/Section";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Github, Pencil, Plus, Trash2, Briefcase, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { ProjectFormDialog } from "@/components/admin/ProjectFormDialog";
import { LogoFormDialog } from "@/components/admin/LogoFormDialog";
import { toast } from "sonner";

export default function Projects() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<any | null>(null);
  const [logoOpen, setLogoOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("featured", { ascending: false })
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: logos = [], isLoading: logosLoading } = useQuery({
    queryKey: ["logos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logos")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Project deleted");
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  async function handleDeleteLogo(id: string) {
    if (!confirm("Delete this logo?")) return;
    const { error } = await supabase.from("logos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Logo deleted");
    queryClient.invalidateQueries({ queryKey: ["logos"] });
  }

  return (
    <Section
      eyebrow="Selected Work"
      title="Projects & Logo Design"
      description="A curated collection of things I've built and brands I've crafted."
    >
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects"><Briefcase className="h-3.5 w-3.5 mr-1.5" /> Projects</TabsTrigger>
          <TabsTrigger value="logos"><Palette className="h-3.5 w-3.5 mr-1.5" /> Logo Design</TabsTrigger>
        </TabsList>

        {/* PROJECTS */}
        <TabsContent value="projects" className="mt-6">
          {isAdmin && (
            <div className="mb-6">
              <Button onClick={() => { setEditing(null); setOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add project
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-72" />
              ))}
            </div>
          )}

          {!isLoading && projects.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No projects yet. {isAdmin && "Click 'Add project' to create one."}</p>
            </Card>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p: any, i: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Card className="group overflow-hidden h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="aspect-video bg-muted overflow-hidden relative">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-primary opacity-20" />
                    )}
                    {p.featured && (
                      <span className="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded bg-primary text-primary-foreground">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{p.title}</h3>
                      {p.timeline && <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{p.timeline}</span>}
                    </div>
                    {p.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{p.description}</p>}
                    {p.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {p.tech_stack.map((t: string) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex items-center gap-2">
                      {p.repo_url && (
                        <Button asChild variant="outline" size="sm">
                          <a href={p.repo_url} target="_blank" rel="noreferrer">
                            <Github className="h-3.5 w-3.5 mr-1.5" /> Code
                          </a>
                        </Button>
                      )}
                      {p.live_url && (
                        <Button asChild size="sm">
                          <a href={p.live_url} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Live
                          </a>
                        </Button>
                      )}
                      {isAdmin && (
                        <div className="ml-auto flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* LOGOS */}
        <TabsContent value="logos" className="mt-6">
          {isAdmin && (
            <div className="mb-6">
              <Button onClick={() => { setEditingLogo(null); setLogoOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add logo
              </Button>
            </div>
          )}

          {logosLoading && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-square" />)}
            </div>
          )}

          {!logosLoading && logos.length === 0 && (
            <Card className="p-12 text-center">
              <Palette className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No logos yet. {isAdmin && "Click 'Add logo' to upload your first design."}</p>
            </Card>
          )}

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {logos.map((l: any, i: number) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 8) * 0.04 }}
              >
                <Card className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="aspect-square bg-muted/50 overflow-hidden relative flex items-center justify-center">
                    {l.image_url ? (
                      <img
                        src={l.image_url}
                        alt={l.title}
                        loading="lazy"
                        className="h-full w-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Palette className="h-12 w-12 text-muted-foreground" />
                    )}
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => { setEditingLogo(l); setLogoOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => handleDeleteLogo(l.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate">{l.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {[l.client, l.year].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <ProjectFormDialog open={open} onOpenChange={setOpen} project={editing} />
      <LogoFormDialog open={logoOpen} onOpenChange={setLogoOpen} logo={editingLogo} />
    </Section>
  );
}
