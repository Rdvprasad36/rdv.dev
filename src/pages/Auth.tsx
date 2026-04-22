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
            <h1 className="text-2xl font-bold">Admin Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Restricted access. Sign in to manage your portfolio.
            </p>
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
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Don't have an account? Visit the Admin page to create one (it will be granted admin role automatically if no admin exists yet).
          </p>
          <Button variant="link" className="w-full mt-2" onClick={() => navigate("/admin/setup")}>
            Create initial admin account
          </Button>
        </Card>
      </div>
    </Section>
  );
}
