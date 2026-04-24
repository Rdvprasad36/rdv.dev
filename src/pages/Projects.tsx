import { Section } from "@/components/Section";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Github, Pencil, Plus, Trash2, Palette, FolderGit2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { ProjectFormDialog } from "@/components/admin/ProjectFormDialog";
import { InlineEdit } from "@/components/admin/InlineEdit";
import { toast } from "sonner";

export default function Projects() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

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
      const { data, error } = await supabase.from("logos").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Project deleted");
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  async function addLogo() {
    const { error } = await supabase.from("logos").insert({
      title: "New logo",
      client: "",
      year: "",
      description: "",
      sort_order: 999,
    });
    if (error) return toast.error(error.message);
    toast.success("Logo added");
    queryClient.invalidateQueries({ queryKey: ["logos"] });
  }

  async function deleteLogo(id: string) {
    if (!confirm("Delete this logo?")) return;
    const { error } = await supabase.from("logos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    queryClient.invalidateQueries({ queryKey: ["logos"] });
  }

  return (
    <Section
      eyebrow="Selected Work"
      title="Projects & Designs"
      description="A curated collection of things I've built and designed."
    >
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="projects" className="gap-2">
            <FolderGit2 className="h-4 w-4" /> Projects
          </TabsTrigger>
          <TabsTrigger value="logos" className="gap-2">
            <Palette className="h-4 w-4" /> Logo Designs
          </TabsTrigger>
        </TabsList>

        {/* ============= PROJECTS TAB ============= */}
        <TabsContent value="projects" className="space-y-6">
          {isAdmin && (
            <div>
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

        {/* ============= LOGOS TAB ============= */}
        <TabsContent value="logos" className="space-y-6">
          {isAdmin && (
            <div>
              <Button onClick={addLogo}>
                <Plus className="h-4 w-4 mr-2" /> Add logo
              </Button>
            </div>
          )}

          {logosLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          )}

          {!logosLoading && logos.length === 0 && (
            <Card className="p-12 text-center">
              <Palette className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No logo designs yet. {isAdmin && "Click 'Add logo' to upload your first one."}</p>
            </Card>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(logos as any[]).map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Card className="group overflow-hidden h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="aspect-square bg-muted overflow-hidden relative flex items-center justify-center p-6">
                    {l.image_url ? (
                      <img
                        src={l.image_url}
                        alt={l.title}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Palette className="h-16 w-16 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold">{l.title}</h3>
                      {l.year && <span className="text-xs text-muted-foreground font-mono">{l.year}</span>}
                    </div>
                    {l.client && <p className="text-xs text-primary font-medium mb-1">{l.client}</p>}
                    {l.description && <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>}
                    {isAdmin && (
                      <div className="mt-3 flex gap-1 justify-end">
                        <InlineEdit
                          table="logos"
                          rowId={l.id}
                          row={l}
                          invalidateKeys={["logos"]}
                          label="Edit logo"
                          fields={[
                            { key: "title", label: "Title" },
                            { key: "client", label: "Client" },
                            { key: "year", label: "Year" },
                            { key: "description", label: "Description", type: "textarea" },
                            { key: "image_url", label: "Logo image", type: "image" },
                          ]}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteLogo(l.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <ProjectFormDialog open={open} onOpenChange={setOpen} project={editing} />
    </Section>
  );
}
