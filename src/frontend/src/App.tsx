import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { Voter } from "./backend.d";
import AdminDashboardScreen from "./screens/AdminDashboardScreen";
import AdminLoginScreen from "./screens/AdminLoginScreen";
import AlreadyVotedScreen from "./screens/AlreadyVotedScreen";
import HomeScreen from "./screens/HomeScreen";
import VoteSuccessScreen from "./screens/VoteSuccessScreen";
import VoterLoginScreen from "./screens/VoterLoginScreen";
import VotingScreen from "./screens/VotingScreen";

export type Screen =
  | "home"
  | "voter-login"
  | "voting"
  | "vote-success"
  | "already-voted"
  | "admin-login"
  | "admin-dashboard";

export interface AppState {
  screen: Screen;
  currentVoter: Voter | null;
  isAdmin: boolean;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    screen: "home",
    currentVoter: null,
    isAdmin: false,
  });

  const navigate = (screen: Screen, extra?: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, screen, ...extra }));
  };

  const goHome = () => {
    setAppState({ screen: "home", currentVoter: null, isAdmin: false });
  };

  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-start bg-background">
      <div className="w-full max-w-[420px] min-h-dvh flex flex-col relative">
        {appState.screen === "home" && (
          <HomeScreen
            onVoterLogin={() => navigate("voter-login")}
            onAdminLogin={() => navigate("admin-login")}
          />
        )}
        {appState.screen === "voter-login" && (
          <VoterLoginScreen
            onBack={goHome}
            onSuccess={(voter) => navigate("voting", { currentVoter: voter })}
            onAlreadyVoted={(voter) =>
              navigate("already-voted", { currentVoter: voter })
            }
          />
        )}
        {appState.screen === "voting" && appState.currentVoter && (
          <VotingScreen
            voter={appState.currentVoter}
            onSuccess={() => navigate("vote-success")}
            onBack={goHome}
          />
        )}
        {appState.screen === "vote-success" && (
          <VoteSuccessScreen onDone={goHome} />
        )}
        {appState.screen === "already-voted" && (
          <AlreadyVotedScreen onHome={goHome} />
        )}
        {appState.screen === "admin-login" && (
          <AdminLoginScreen
            onBack={goHome}
            onSuccess={() => navigate("admin-dashboard", { isAdmin: true })}
          />
        )}
        {appState.screen === "admin-dashboard" && (
          <AdminDashboardScreen onLogout={goHome} />
        )}
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
