import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import Overview from "./pages/Overview";
import Projects from "./pages/Projects";
import Blog from "./pages/Blog";
import Stats from "./pages/Stats";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import AdminSetup from "./pages/AdminSetup";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Overview />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin/setup" element={<AdminSetup />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
