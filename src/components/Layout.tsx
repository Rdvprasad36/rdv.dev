import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Intro } from "./Intro";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Intro />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
