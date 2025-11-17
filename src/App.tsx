import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { useGame } from "./context/GameContext";
import { LandingPage } from "./components/LandingPage";
import { LobbyScreen } from "./components/LobbyScreen";
import { Gameboard } from "./components/Gameboard";
import { Toaster } from "@/components/ui/sonner";
import { Tutorial } from "./components/Tutorial";

function ProtectedGameRoute() {
  const { state } = useGame();
  const hasPlayers = Array.isArray(state.players) && state.players.length > 0;

  // Guard: if no players are set up (e.g., direct URL to /game), go back to lobby
  if (!hasPlayers) {
    return <Navigate to="/lobby" replace />;
  }

  return <Gameboard />;
}

function App() {
  const { state } = useGame();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync route with game phase, but:
  // - Do not override landing ("/")
  // - Do not override unknown routes (let "*" fallback handle redirect to "/")
  useEffect(() => {
    if (location.pathname === "/") return;

    // Ignore unknown paths so the fallback route can redirect to "/"
    if (location.pathname !== "/lobby" && location.pathname !== "/game") {
      return;
    }

    if (state.gamePhase === "lobby" && location.pathname !== "/lobby") {
      navigate("/lobby", { replace: true });
      return;
    }

    if (state.gamePhase !== "lobby" && location.pathname !== "/game") {
      navigate("/game", { replace: true });
    }
  }, [state.gamePhase, location.pathname, navigate]);

  return (
    <main className="min-h-screen bg-background font-sans">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                key="landing"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
              >
                <LandingPage onEnter={() => navigate("/lobby")} />
              </motion.div>
            }
          />

          <Route
            path="/lobby"
            element={
              <motion.div
                key="lobby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <LobbyScreen />
              </motion.div>
            }
          />

          <Route
            path="/game"
            element={
              <motion.div
                key="gameboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ProtectedGameRoute />
              </motion.div>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <Toaster richColors theme="light" />
      <Tutorial />
    </main>
  );
}

export default App;
