import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Section } from "@/components/Section";
import { LogIn } from "lucide-react";

export default function Auth() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate("/");
  }

  return (
    <Section>
      <div className="max-w-md mx-auto">
        <Card className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
              <LogIn className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Admin sign in</h1>
            <p className="text-sm text-muted-foreground mt-2">
              This sign‑in is for the <span className="font-semibold text-foreground">website owner</span> only.
            </p>
            <div className="mt-3 text-xs text-muted-foreground rounded-md bg-secondary/60 border border-border/60 p-3 text-left">
              <p className="font-semibold text-foreground mb-1">Admin features unlock:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Edit profile, bio, contact & resume</li>
                <li>Manage experience, education, skills & achievements</li>
                <li>Add / remove projects, posts & logo designs</li>
                <li>Read inquiries from the contact form</li>
              </ul>
              <p className="mt-2 text-[11px] text-muted-foreground/80">
                Visitors can browse everything without signing in.
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
              {loading ? "Signing in…" : "Sign in as admin"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            First-time setup? Create the initial admin account below — only allowed when no admin exists yet.
          </p>
          <Button variant="link" className="w-full mt-2" onClick={() => navigate("/admin/setup")}>
            Create initial admin account
          </Button>
        </Card>
      </div>
    </Section>
  );
}
