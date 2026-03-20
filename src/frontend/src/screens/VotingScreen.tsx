import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Candidate, Voter } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  voter: Voter;
  onSuccess: () => void;
  onBack: () => void;
}

const AVATAR_CLASSES = [
  "avatar-indigo",
  "avatar-teal",
  "avatar-rose",
  "avatar-violet",
  "avatar-emerald",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function VotingScreen({ voter, onSuccess, onBack }: Props) {
  const { actor, isFetching } = useActor();
  const [votingFor, setVotingFor] = useState<string | null>(null);

  const { data: candidates, isLoading } = useQuery<Candidate[]>({
    queryKey: ["candidates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVoteResults();
    },
    enabled: !!actor && !isFetching,
  });

  const handleVote = async (candidate: Candidate) => {
    if (!actor) {
      toast.error("Connection error. Please try again.");
      return;
    }

    setVotingFor(candidate.candidateId);
    try {
      await actor.castVote(voter.voterId, candidate.candidateId);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("already voted")) {
        toast.error("You have already voted.");
      } else {
        toast.error("Failed to cast vote. Please try again.");
      }
    } finally {
      setVotingFor(null);
    }
  };

  return (
    <main className="flex flex-col min-h-dvh page-enter">
      {/* Header */}
      <div className="vote-hero px-4 pt-12 pb-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors mb-5 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-body">Exit</span>
        </button>
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            Cast Your Vote
          </h1>
          <p className="text-white/60 text-sm mt-1 font-body">
            Voting as{" "}
            <span className="text-white/90 font-semibold tracking-wide">
              {voter.voterId}
            </span>
          </p>
        </div>
      </div>

      {/* Candidates list */}
      <div className="flex-1 px-5 py-6 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-display font-semibold text-foreground">
            Select a candidate
          </p>
          {candidates && (
            <span className="text-xs text-muted-foreground font-body">
              {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div data-ocid="voting.loading_state" className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl p-4 shadow-card"
                style={{
                  background: "oklch(var(--card))",
                  border: "1.5px solid oklch(var(--border))",
                }}
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-9 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Candidates */}
        {!isLoading && candidates && candidates.length > 0 && (
          <AnimatePresence>
            {candidates.map((candidate, idx) => {
              const ocidIndex = idx + 1;
              const avatarClass = AVATAR_CLASSES[idx % AVATAR_CLASSES.length];
              const isVotingThisOne = votingFor === candidate.candidateId;
              const isVotingAny = votingFor !== null;

              return (
                <motion.div
                  key={candidate.candidateId}
                  data-ocid={`voting.candidate.item.${ocidIndex}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: idx * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="rounded-xl p-4 shadow-card transition-all duration-200 hover:shadow-card-hover"
                  style={{
                    background: "oklch(var(--card))",
                    border: "1.5px solid oklch(var(--border))",
                    opacity: isVotingAny && !isVotingThisOne ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${avatarClass}`}
                    >
                      <span className="text-white font-display font-bold text-lg">
                        {getInitials(candidate.candidateName)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-foreground text-base leading-tight truncate">
                        {candidate.candidateName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-body">
                        Candidate #{candidate.candidateId}
                      </p>
                    </div>

                    {/* Vote button */}
                    <Button
                      data-ocid={`voting.candidate.vote_button.${ocidIndex}`}
                      onClick={() => handleVote(candidate)}
                      disabled={isVotingAny}
                      size="sm"
                      className="rounded-lg font-display font-semibold text-sm shrink-0 h-9 px-4 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                      style={{
                        background: isVotingThisOne
                          ? "oklch(0.28 0.12 268)"
                          : "oklch(0.28 0.12 268)",
                        color: "white",
                        boxShadow: "0 2px 6px oklch(0.28 0.12 268 / 0.3)",
                      }}
                    >
                      {isVotingThisOne ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Voting
                        </span>
                      ) : (
                        "Vote"
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Empty state */}
        {!isLoading && candidates && candidates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "oklch(var(--muted))" }}
            >
              <svg
                className="w-7 h-7 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground font-body text-center">
              No candidates available yet.
              <br />
              Please check back later.
            </p>
          </div>
        )}

        {/* Notice */}
        <div
          className="mt-2 flex items-start gap-2.5 px-4 py-3 rounded-xl"
          style={{
            background: "oklch(0.28 0.12 268 / 0.06)",
            border: "1px solid oklch(0.28 0.12 268 / 0.12)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
            style={{ background: "oklch(0.28 0.12 268)" }}
          />
          <p className="text-xs text-muted-foreground font-body leading-relaxed">
            Your vote is final. Once submitted, it cannot be changed.
          </p>
        </div>
      </div>
    </main>
  );
}
