import { Section } from "@/components/Section";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Download, MapPin, Mail, Briefcase, GraduationCap, Award, Code2 } from "lucide-react";
import profileDefault from "@/assets/profile-default.jpg";
import { motion } from "framer-motion";

export default function Overview() {
  const { data: profile, isLoading } = useProfile();

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

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-x-0 top-0 h-[400px] bg-gradient-glow" />
        <div className="container relative py-16 md:py-24">
          <div className="grid md:grid-cols-[auto,1fr] gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto md:mx-0"
            >
              <div className="absolute -inset-4 bg-gradient-primary rounded-full opacity-30 blur-2xl" />
              <img
                src={profile?.profile_pic_url || profileDefault}
                alt={profile?.name || "Profile"}
                className="relative h-40 w-40 md:h-48 md:w-48 rounded-full object-cover border-4 border-background shadow-lg"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-center md:text-left"
            >
              {profile?.is_available && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-sm font-medium mb-4">
                  <span className="pulse-dot" />
                  <span className="text-success">Available for new opportunities</span>
                </div>
              )}
              {isLoading ? (
                <Skeleton className="h-12 w-72 mb-3" />
              ) : (
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">
                  {profile?.name}
                </h1>
              )}
              <p className="text-lg md:text-xl text-muted-foreground mb-4">
                {profile?.tagline}
              </p>
              {profile?.bio && (
                <p className="max-w-2xl text-muted-foreground mb-6">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground justify-center md:justify-start mb-6">
                {profile?.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {profile.location}
                  </span>
                )}
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    <Mail className="h-4 w-4" /> {profile.email}
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {profile?.resume_url && (
                  <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-md">
                    <a href={profile.resume_url} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4 mr-2" /> Download Resume
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg">
                  <a href="/contact">Get in touch</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE TIMELINE */}
      {experience.length > 0 && (
        <Section
          id="experience"
          eyebrow="Journey"
          title="Experience"
          description="Roles, projects and internships that have shaped my craft."
        >
          <div className="relative pl-8 md:pl-10 space-y-8 before:absolute before:left-3 md:before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border">
            {experience.map((exp: any, i: number) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative"
              >
                <span className="absolute -left-[26px] md:-left-[30px] top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                <Card className="p-5 md:p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" /> {exp.role}
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono">{exp.duration}</span>
                  </div>
                  <p className="text-sm text-primary font-medium mb-2">{exp.company}</p>
                  {exp.description && <p className="text-sm text-muted-foreground mb-3">{exp.description}</p>}
                  {exp.tech?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exp.tech.map((t: string) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* SKILLS BENTO */}
      {skills.length > 0 && (
        <Section eyebrow="Toolbelt" title="Skills" description="Languages, frameworks, and tools I work with daily.">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {skills.map((s: any, i: number) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="group p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                  <p className="font-medium text-sm">{s.name}</p>
                </div>
                {s.category && <p className="text-xs text-muted-foreground">{s.category}</p>}
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* EDUCATION */}
      {education.length > 0 && (
        <Section eyebrow="Background" title="Education">
          <div className="grid md:grid-cols-2 gap-4">
            {education.map((ed: any) => (
              <Card key={ed.id} className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{ed.institution}</h3>
                    <p className="text-sm text-muted-foreground">{ed.degree} {ed.field && `· ${ed.field}`}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{ed.duration}</p>
                    {ed.description && <p className="text-sm mt-2">{ed.description}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* ACHIEVEMENTS */}
      {achievements.length > 0 && (
        <Section eyebrow="Highlights" title="Achievements">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((a: any) => (
              <Card key={a.id} className="p-5 hover:shadow-md transition-shadow">
                <Award className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold mb-1">{a.title}</h3>
                {a.date && <p className="text-xs text-muted-foreground font-mono mb-2">{a.date}</p>}
                {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
              </Card>
            ))}
          </div>
        </Section>
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
    </>
  );
}
