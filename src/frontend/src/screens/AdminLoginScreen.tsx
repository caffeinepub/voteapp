import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowLeft,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export default function AdminLoginScreen({ onBack, onSuccess }: Props) {
  const { actor } = useActor();
  const { login, loginStatus } = useInternetIdentity();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoggingIn = loginStatus === "logging-in";

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!actor) {
      setError("Connection error. Please try again.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Trigger ICP Internet Identity login
      login();

      // Wait for login to complete by polling
      let attempts = 0;
      const maxAttempts = 60; // 30 second timeout

      const checkLogin = async (): Promise<boolean> => {
        attempts++;
        if (attempts > maxAttempts) return false;
        await new Promise((r) => setTimeout(r, 500));

        try {
          const isAdmin = await actor.isCallerAdmin();
          if (isAdmin) return true;
        } catch {
          // Not yet authenticated
        }
        return checkLogin();
      };

      const adminConfirmed = await checkLogin();

      if (!adminConfirmed) {
        // Try once more with a direct call
        try {
          await actor.adminLogin();
          const isAdmin = await actor.isCallerAdmin();
          if (isAdmin) {
            onSuccess();
            return;
          }
        } catch {
          // ignore
        }
        setError("Access denied. Not an admin account.");
      } else {
        toast.success("Admin access granted");
        onSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("denied") ||
        msg.toLowerCase().includes("admin")
      ) {
        setError("Access denied. Not an admin account.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-dvh page-enter">
      {/* Header */}
      <div className="vote-hero px-4 pt-12 pb-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-body">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "oklch(1 0 0 / 0.15)",
              border: "1px solid oklch(1 0 0 / 0.2)",
            }}
          >
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              Admin Login
            </h1>
            <p className="text-white/60 text-xs font-body">
              Secure operator access
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 py-8">
        <motion.form
          onSubmit={handleAdminLogin}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4"
        >
          {/* ICP Auth info */}
          <div
            className="rounded-xl px-4 py-3.5 flex items-start gap-3"
            style={{
              background: "oklch(0.28 0.12 268 / 0.06)",
              border: "1.5px solid oklch(0.28 0.12 268 / 0.15)",
            }}
          >
            <Info
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: "oklch(0.28 0.12 268)" }}
            />
            <div>
              <p className="text-sm font-body text-foreground/80 leading-relaxed">
                You will be prompted to authenticate using Internet Identity.
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-body">
                A secure wallet popup will appear. Only the designated admin can
                access the panel.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              data-ocid="admin_login.error_state"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 rounded-xl px-4 py-3"
              style={{
                background: "oklch(var(--destructive) / 0.08)",
                border: "1px solid oklch(var(--destructive) / 0.2)",
              }}
            >
              <AlertCircle
                className="w-4 h-4 shrink-0"
                style={{ color: "oklch(var(--destructive))" }}
              />
              <p
                className="text-sm font-body"
                style={{ color: "oklch(var(--destructive))" }}
              >
                {error}
              </p>
            </motion.div>
          )}

          <div className="mt-2">
            <Label className="text-sm font-body font-medium mb-2 block">
              Admin Authentication
            </Label>
            <Button
              data-ocid="admin_login.submit_button"
              type="submit"
              disabled={isLoading || isLoggingIn}
              className="w-full h-13 rounded-xl text-base font-display font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "oklch(0.28 0.12 268)",
                color: "white",
                boxShadow: "0 4px 16px oklch(0.28 0.12 268 / 0.3)",
              }}
            >
              {isLoading || isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Login as Admin
                </span>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground font-body px-4">
            Admin access is restricted to authorized operators only.
          </p>
        </motion.form>
      </div>
    </main>
  );
}
