import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Section } from "@/components/Section";
import { Shield } from "lucide-react";

export default function AdminSetup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // 1. Sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (signUpError) {
      setLoading(false);
      toast.error(signUpError.message);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setLoading(false);
      toast.error("Could not create user. Please try again.");
      return;
    }

    // 2. Try to grant admin role via the bootstrap function
    const { error: bootstrapError } = await supabase.functions.invoke("bootstrap-admin", {
      body: { user_id: userId },
    });

    setLoading(false);

    if (bootstrapError) {
      toast.error("Account created but admin role assignment failed. Contact support.");
      console.error(bootstrapError);
      return;
    }

    toast.success("Admin account created! Signing you in…");

    // If session was returned (email confirmation off), navigate. Otherwise prompt sign-in.
    if (signUpData.session) {
      navigate("/");
    } else {
      navigate("/auth");
    }
  }

  return (
    <Section>
      <div className="max-w-md mx-auto">
        <Card className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Initial Admin Setup</h1>
            <p className="text-sm text-muted-foreground mt-1">
              This page lets the very first admin claim the portfolio. After one admin exists, this page is locked.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Admin email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              <p className="text-xs text-muted-foreground mt-1">At least 8 characters.</p>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
              {loading ? "Creating…" : "Create admin account"}
            </Button>
          </form>
        </Card>
      </div>
    </Section>
  );
}
