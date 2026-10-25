"use client";

import { useState, useEffect } from "react";
import { Route, User } from "../components/data";
import Nav from "../components/Nav";
import Library from "../components/Library";
import GameDetail from "../components/GameDetail";
import GamePlayer from "../components/GamePlayer";
import Auth from "../components/Auth";
import HallOfFame from "../components/HallOfFame";

export default function Home() {
  const [route, setRoute] = useState<Route>({ name: "biblioteca" });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const h = location.hash.replace(/^#/, "");
      if (h) setRoute(JSON.parse(decodeURIComponent(h)) as Route);
    } catch (e) {}
    try { setUser(JSON.parse(localStorage.getItem("av_user") || "null")); } catch (e) {}
  }, []);

  useEffect(() => {
    location.hash = encodeURIComponent(JSON.stringify(route));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route]);

  const navigate = (r: Route) => setRoute(r);
  const handleLogin = (u: User | null) => { setUser(u); localStorage.setItem("av_user", JSON.stringify(u)); };
  const handleSignOut = () => { setUser(null); localStorage.removeItem("av_user"); };
  const handleSaveScore = (entry: { game: string; score: number; name: string }) => {
    try {
      const all = JSON.parse(localStorage.getItem("av_scores") || "[]");
      all.push({ ...entry, at: Date.now() });
      localStorage.setItem("av_scores", JSON.stringify(all));
    } catch (e) {}
  };

  let screen = null;
  if (route.name === "biblioteca") screen = <Library navigate={navigate} />;
  else if (route.name === "detalle") screen = <GameDetail id={route.id} navigate={navigate} />;
  else if (route.name === "player") screen = <GamePlayer id={route.id} user={user} navigate={navigate} onSaveScore={handleSaveScore} />;
  else if (route.name === "auth") screen = <Auth navigate={navigate} onLogin={handleLogin} />;
  else if (route.name === "salon") screen = <HallOfFame user={user} navigate={navigate} />;

  return (
    <>
      <div className="av-bg" />
      <div className="av-noise" />
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", minHeight: "100%" }}>
        <Nav route={route} navigate={navigate} user={user} onSignOut={handleSignOut} />
        <main className="av-main">{screen}</main>
        <footer style={{ borderTop: "1px solid var(--line)", padding: "20px 32px", textAlign: "center", color: "var(--ink-faint)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.16em" }}>
          © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
        </footer>
      </div>
    </>
  );
}
