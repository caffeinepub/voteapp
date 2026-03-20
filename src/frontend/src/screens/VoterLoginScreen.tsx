import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useRef, useState } from "react";
import type { Voter } from "../backend.d";
import { VoterStatus } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  onBack: () => void;
  onSuccess: (voter: Voter) => void;
  onAlreadyVoted: (voter: Voter) => void;
}

export default function VoterLoginScreen({
  onBack,
  onSuccess,
  onAlreadyVoted,
}: Props) {
  const { actor } = useActor();
  const [voterId, setVoterId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedId = voterId.trim().toUpperCase();
    if (!trimmedId) {
      setError("Please enter your Voter ID.");
      inputRef.current?.focus();
      return;
    }

    if (!actor) {
      setError("Connection error. Please try again.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const voter = await actor.loginVoter(trimmedId);
      if (voter.status === "voted") {
        onAlreadyVoted(voter);
      } else {
        onSuccess(voter);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("already voted")) {
        onAlreadyVoted({ voterId: trimmedId, status: VoterStatus.voted });
      } else if (
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("voter")
      ) {
        setError("Voter ID not found. Please check and try again.");
      } else {
        setError("Voter ID not found. Please check and try again.");
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
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              Voter Login
            </h1>
            <p className="text-white/60 text-xs font-body">
              Enter your unique Voter ID
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 py-8">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-5"
        >
          <div
            className="rounded-2xl p-5 shadow-card"
            style={{
              background: "oklch(var(--card))",
              border: "1.5px solid oklch(var(--border))",
            }}
          >
            <div className="flex flex-col gap-3">
              <Label
                htmlFor="voter-id"
                className="font-body font-medium text-sm text-foreground"
              >
                Voter ID
              </Label>
              <Input
                ref={inputRef}
                id="voter-id"
                data-ocid="voter_login.input"
                type="text"
                placeholder="e.g. VOTER001"
                value={voterId}
                onChange={(e) => {
                  setVoterId(e.target.value);
                  if (error) setError(null);
                }}
                className="font-body text-base tracking-wider uppercase font-semibold h-12 rounded-xl"
                style={{
                  fontSize: "1rem", // >= 16px to prevent zoom on iOS
                  background: "oklch(var(--background))",
                  border: error
                    ? "1.5px solid oklch(var(--destructive))"
                    : "1.5px solid oklch(var(--border))",
                }}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                aria-describedby={error ? "voter-id-error" : undefined}
                aria-invalid={!!error}
              />
              {error && (
                <motion.div
                  id="voter-id-error"
                  data-ocid="voter_login.error_state"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5"
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
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <div
              className="w-1 h-1 rounded-full mt-2 shrink-0"
              style={{ background: "oklch(0.72 0.16 195)" }}
            />
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Your Voter ID was provided by the event organizer. It looks like{" "}
              <span className="font-semibold text-foreground/70">VOTER001</span>
              ,{" "}
              <span className="font-semibold text-foreground/70">VOTER002</span>
              , etc.
            </p>
          </div>

          <Button
            data-ocid="voter_login.submit_button"
            type="submit"
            disabled={isLoading || !voterId.trim()}
            className="h-13 rounded-xl text-base font-display font-semibold shadow-button transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "oklch(0.28 0.12 268)",
              color: "white",
            }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              "Continue to Vote"
            )}
          </Button>
        </motion.form>
      </div>
    </main>
  );
}
