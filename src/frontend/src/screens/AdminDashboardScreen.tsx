import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart3,
  Loader2,
  LogOut,
  RefreshCw,
  RotateCcw,
  Trash2,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Candidate, Voter } from "../backend.d";
import { VoterStatus } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  onLogout: () => void;
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

export default function AdminDashboardScreen({ onLogout }: Props) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("results");
  const [addVoterOpen, setAddVoterOpen] = useState(false);
  const [newVoterId, setNewVoterId] = useState("");
  const [deleteConfirmVoter, setDeleteConfirmVoter] = useState<string | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Results Query (polls every 5s) ──────────────────────────────
  const { data: results, isLoading: resultsLoading } = useQuery<Candidate[]>({
    queryKey: ["admin-results"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVoteResults();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });

  // ── Voters Query ─────────────────────────────────────────────────
  const { data: voters, isLoading: votersLoading } = useQuery<Voter[]>({
    queryKey: ["admin-voters"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVoters();
    },
    enabled: !!actor && !isFetching,
  });

  // ── Mutations ────────────────────────────────────────────────────
  const addVoterMutation = useMutation({
    mutationFn: async (voterId: string) => {
      if (!actor) throw new Error("No actor");
      await actor.addVoter(voterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-voters"] });
      toast.success("Voter added successfully");
      setAddVoterOpen(false);
      setNewVoterId("");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        msg.includes("already exists")
          ? "Voter ID already exists."
          : "Failed to add voter.",
      );
    },
  });

  const deleteVoterMutation = useMutation({
    mutationFn: async (voterId: string) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteVoter(voterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-voters"] });
      toast.success("Voter deleted");
      setDeleteConfirmVoter(null);
    },
    onError: () => toast.error("Failed to delete voter."),
  });

  const resetVoterMutation = useMutation({
    mutationFn: async (voterId: string) => {
      if (!actor) throw new Error("No actor");
      await actor.resetVoterStatus(voterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-voters"] });
      toast.success("Voter status reset");
    },
    onError: () => toast.error("Failed to reset voter status."),
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["admin-results"] }),
      queryClient.refetchQueries({ queryKey: ["admin-voters"] }),
    ]);
    setIsRefreshing(false);
  }, [queryClient]);

  // ── Compute totals ───────────────────────────────────────────────
  const totalVotes = results
    ? results.reduce((sum, c) => sum + Number(c.voteCount), 0)
    : 0;

  const leadingCandidate =
    results && results.length > 0
      ? results.reduce((a, b) =>
          Number(a.voteCount) >= Number(b.voteCount) ? a : b,
        )
      : null;

  const votedCount = voters
    ? voters.filter((v) => v.status === VoterStatus.voted).length
    : 0;
  const totalVoters = voters ? voters.length : 0;

  return (
    <main className="flex flex-col min-h-dvh page-enter">
      {/* Top header */}
      <div className="vote-hero px-4 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "oklch(1 0 0 / 0.15)",
                border: "1px solid oklch(1 0 0 / 0.2)",
              }}
            >
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white leading-none">
                Admin Panel
              </h1>
              <p className="text-white/50 text-xs font-body">Live results</p>
            </div>
          </div>
          <Button
            data-ocid="admin_dashboard.secondary_button"
            onClick={onLogout}
            size="sm"
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg font-body text-sm h-8 px-3 gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            className="rounded-xl px-3.5 py-3"
            style={{
              background: "oklch(1 0 0 / 0.1)",
              border: "1px solid oklch(1 0 0 / 0.15)",
            }}
          >
            <p className="text-white/50 text-xs font-body">Total Votes</p>
            <p className="font-display font-bold text-xl text-white">
              {resultsLoading ? "—" : totalVotes}
            </p>
          </div>
          <div
            className="rounded-xl px-3.5 py-3"
            style={{
              background: "oklch(1 0 0 / 0.1)",
              border: "1px solid oklch(1 0 0 / 0.15)",
            }}
          >
            <p className="text-white/50 text-xs font-body">
              Voters Participated
            </p>
            <p className="font-display font-bold text-xl text-white">
              {votersLoading ? "—" : `${votedCount}/${totalVoters}`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col px-4 pt-4 pb-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4 gap-3">
            <TabsList
              className="grid grid-cols-2 flex-1 rounded-xl h-10"
              style={{ background: "oklch(var(--secondary))" }}
            >
              <TabsTrigger
                value="results"
                data-ocid="admin_results.tab"
                className="rounded-lg text-sm font-display font-medium data-[state=active]:shadow-xs"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Results
              </TabsTrigger>
              <TabsTrigger
                value="voters"
                data-ocid="admin_voters.tab"
                className="rounded-lg text-sm font-display font-medium data-[state=active]:shadow-xs"
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Voters
              </TabsTrigger>
            </TabsList>

            <Button
              data-ocid="admin_results.secondary_button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="sm"
              variant="outline"
              className="h-10 px-3 rounded-xl font-body text-sm shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* ── RESULTS TAB ── */}
          <TabsContent
            value="results"
            className="flex-1 flex flex-col gap-3 mt-0"
          >
            {resultsLoading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl p-4 shadow-card"
                    style={{
                      background: "oklch(var(--card))",
                      border: "1.5px solid oklch(var(--border))",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            )}

            {!resultsLoading && results && (
              <div
                data-ocid="admin_results.table"
                className="flex flex-col gap-2.5"
              >
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "oklch(var(--muted))" }}
                    >
                      <Trophy className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-body text-center">
                      No results yet. Votes will appear here.
                    </p>
                  </div>
                ) : (
                  results
                    .slice()
                    .sort((a, b) => Number(b.voteCount) - Number(a.voteCount))
                    .map((candidate, idx) => {
                      const ocidIndex = idx + 1;
                      const pct =
                        totalVotes > 0
                          ? (Number(candidate.voteCount) / totalVotes) * 100
                          : 0;
                      const isLeading =
                        leadingCandidate?.candidateId ===
                          candidate.candidateId &&
                        Number(candidate.voteCount) > 0;
                      const avatarClass =
                        AVATAR_CLASSES[idx % AVATAR_CLASSES.length];

                      return (
                        <motion.div
                          key={candidate.candidateId}
                          data-ocid={`admin_results.item.${ocidIndex}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className="rounded-xl p-4 shadow-card"
                          style={{
                            background: "oklch(var(--card))",
                            border: isLeading
                              ? "1.5px solid oklch(0.72 0.16 195 / 0.4)"
                              : "1.5px solid oklch(var(--border))",
                          }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${avatarClass}`}
                            >
                              <span className="text-white font-display font-bold text-sm">
                                {getInitials(candidate.candidateName)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-display font-semibold text-foreground text-sm truncate">
                                  {candidate.candidateName}
                                </p>
                                {isLeading && (
                                  <span className="leading-badge text-xs px-2 py-0.5 rounded-full font-body font-medium shrink-0 flex items-center gap-1">
                                    <Trophy className="w-3 h-3" />
                                    Leading
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground font-body">
                                {Number(candidate.voteCount)} votes ·{" "}
                                {pct.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Progress
                              value={pct}
                              className="h-2 rounded-full"
                              style={{
                                background: "oklch(var(--muted))",
                              }}
                            />
                          </div>
                        </motion.div>
                      );
                    })
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground/60 text-center font-body mt-1">
              Results refresh every 5 seconds
            </p>
          </TabsContent>

          {/* ── VOTERS TAB ── */}
          <TabsContent
            value="voters"
            className="flex-1 flex flex-col gap-3 mt-0"
          >
            {/* Add voter button */}
            <Button
              data-ocid="admin_voters.open_modal_button"
              onClick={() => setAddVoterOpen(true)}
              className="w-full h-11 rounded-xl font-display font-semibold text-sm gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "oklch(0.28 0.12 268)",
                color: "white",
                boxShadow: "0 2px 8px oklch(0.28 0.12 268 / 0.25)",
              }}
            >
              <UserPlus className="w-4 h-4" />
              Add Voter
            </Button>

            {/* Voters list */}
            {votersLoading && (
              <div className="flex flex-col gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl px-4 py-3 shadow-card flex items-center gap-3"
                    style={{
                      background: "oklch(var(--card))",
                      border: "1.5px solid oklch(var(--border))",
                    }}
                  >
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-7 w-16 rounded-lg" />
                    <Skeleton className="h-7 w-7 rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {!votersLoading && voters && (
              <div
                data-ocid="admin_voters.table"
                className="flex flex-col gap-2"
              >
                {voters.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "oklch(var(--muted))" }}
                    >
                      <Users className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-body text-center">
                      No voters yet.
                      <br />
                      Add voter IDs to get started.
                    </p>
                  </div>
                ) : (
                  voters.map((voter, idx) => {
                    const ocidIndex = idx + 1;
                    const hasVoted = voter.status === VoterStatus.voted;
                    const isDeleting =
                      deleteVoterMutation.isPending &&
                      deleteVoterMutation.variables === voter.voterId;
                    const isResetting =
                      resetVoterMutation.isPending &&
                      resetVoterMutation.variables === voter.voterId;

                    return (
                      <motion.div
                        key={voter.voterId}
                        data-ocid={`admin_voters.item.${ocidIndex}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.04 }}
                        className="rounded-xl px-4 py-3 shadow-card"
                        style={{
                          background: "oklch(var(--card))",
                          border: "1.5px solid oklch(var(--border))",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-semibold text-sm text-foreground truncate">
                              {voter.voterId}
                            </p>
                            <span
                              className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-body font-medium mt-0.5 ${hasVoted ? "status-voted" : "status-not-voted"}`}
                            >
                              {hasVoted ? "Voted" : "Not Voted"}
                            </span>
                          </div>

                          {/* Reset */}
                          <Button
                            data-ocid={`admin_voters.reset_button.${ocidIndex}`}
                            onClick={() =>
                              resetVoterMutation.mutate(voter.voterId)
                            }
                            disabled={isResetting || isDeleting || !hasVoted}
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 rounded-lg text-xs font-body gap-1 shrink-0"
                            title="Reset voter status"
                          >
                            {isResetting ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                            Reset
                          </Button>

                          {/* Delete */}
                          <Button
                            data-ocid={`admin_voters.delete_button.${ocidIndex}`}
                            onClick={() => setDeleteConfirmVoter(voter.voterId)}
                            disabled={isDeleting || isResetting}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-lg shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                            title="Delete voter"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}

            {/* Voter count */}
            {!votersLoading && voters && voters.length > 0 && (
              <p className="text-xs text-muted-foreground/60 text-center font-body">
                {voters.length} voter{voters.length !== 1 ? "s" : ""} ·{" "}
                {votedCount} voted
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Add Voter Dialog ── */}
      <Dialog open={addVoterOpen} onOpenChange={setAddVoterOpen}>
        <DialogContent
          data-ocid="admin_voters.dialog"
          className="rounded-2xl mx-4 max-w-sm"
          style={{ border: "1.5px solid oklch(var(--border))" }}
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              Add New Voter
            </DialogTitle>
            <DialogDescription className="font-body text-sm">
              Enter a unique Voter ID to register. Example: VOTER004
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              data-ocid="admin_voters.input"
              placeholder="e.g. VOTER004"
              value={newVoterId}
              onChange={(e) => setNewVoterId(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newVoterId.trim()) {
                  addVoterMutation.mutate(newVoterId.trim());
                }
              }}
              className="font-body text-base uppercase tracking-wider font-semibold h-11 rounded-xl"
              style={{ fontSize: "1rem" }}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <DialogFooter className="gap-2 flex-row">
            <Button
              data-ocid="admin_voters.cancel_button"
              variant="outline"
              onClick={() => {
                setAddVoterOpen(false);
                setNewVoterId("");
              }}
              className="flex-1 rounded-xl font-display font-medium"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin_voters.submit_button"
              onClick={() => {
                if (newVoterId.trim()) {
                  addVoterMutation.mutate(newVoterId.trim());
                }
              }}
              disabled={!newVoterId.trim() || addVoterMutation.isPending}
              className="flex-1 rounded-xl font-display font-semibold"
              style={{
                background: "oklch(0.28 0.12 268)",
                color: "white",
              }}
            >
              {addVoterMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Adding...
                </span>
              ) : (
                "Add Voter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <AlertDialog
        open={!!deleteConfirmVoter}
        onOpenChange={(open) => !open && setDeleteConfirmVoter(null)}
      >
        <AlertDialogContent
          className="rounded-2xl mx-4 max-w-sm"
          style={{ border: "1.5px solid oklch(var(--border))" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold">
              Delete Voter?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deleteConfirmVoter}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel
              data-ocid="admin_voters.cancel_button"
              className="flex-1 rounded-xl font-display font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin_voters.delete_button.1"
              onClick={() => {
                if (deleteConfirmVoter) {
                  deleteVoterMutation.mutate(deleteConfirmVoter);
                }
              }}
              className="flex-1 rounded-xl font-display font-semibold"
              style={{
                background: "oklch(var(--destructive))",
                color: "white",
              }}
            >
              {deleteVoterMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error states */}
      {!resultsLoading && !votersLoading && !actor && (
        <div
          data-ocid="admin_dashboard.error_state"
          className="fixed bottom-4 left-4 right-4 max-w-[388px] mx-auto rounded-xl px-4 py-3 flex items-center gap-2.5"
          style={{
            background: "oklch(var(--destructive) / 0.1)",
            border: "1px solid oklch(var(--destructive) / 0.25)",
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
            Connection error. Please refresh.
          </p>
        </div>
      )}
    </main>
  );
}
