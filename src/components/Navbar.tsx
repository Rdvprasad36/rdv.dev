import { Link, NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import logoWhite from "@/assets/logo-white.png";
import logoBlack from "@/assets/logo-black.png";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Overview", end: true },
  { to: "/projects", label: "Projects" },
  { to: "/blog", label: "Blog" },
  { to: "/stats", label: "Stats" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <nav className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <img
            src={theme === "dark" ? logoWhite : logoBlack}
            alt="RDV"
            className="h-8 w-8 object-contain"
          />
          <span className="hidden sm:inline gradient-text">RDV.Dev</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <>
              {isAdmin && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  Admin
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
              <LogIn className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign in</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border/40 glass">
          <div className="container flex flex-col gap-1 py-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
