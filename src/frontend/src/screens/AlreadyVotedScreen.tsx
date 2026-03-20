import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onHome: () => void;
}

export default function AlreadyVotedScreen({ onHome }: Props) {
  return (
    <main className="flex flex-col min-h-dvh items-center justify-center px-5 page-enter">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.45,
          type: "spring",
          stiffness: 200,
          damping: 18,
        }}
        className="relative mb-8 w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: "oklch(var(--muted))",
          border: "2px solid oklch(0.52 0.04 262 / 0.2)",
        }}
      >
        <AlertCircle
          className="w-10 h-10"
          style={{ color: "oklch(0.52 0.04 262)" }}
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Text */}
      <motion.div
        data-ocid="already_voted.error_state"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-6"
      >
        <h1 className="font-display font-bold text-2xl text-foreground mb-3">
          Already Voted
        </h1>
        <p className="font-body text-foreground/80 text-base leading-relaxed mb-2">
          You have already voted.
        </p>
        <p className="font-body text-muted-foreground text-sm">
          Each voter can only vote once.
        </p>
      </motion.div>

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full rounded-xl px-4 py-3.5 mb-8 flex items-start gap-3"
        style={{
          background: "oklch(var(--muted) / 0.6)",
          border: "1.5px solid oklch(var(--border))",
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
          style={{ background: "oklch(0.52 0.04 262)" }}
        />
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          If you believe this is an error, please contact the event
          administrator for assistance.
        </p>
      </motion.div>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.38 }}
        className="w-full"
      >
        <Button
          data-ocid="already_voted.home_button"
          onClick={onHome}
          className="w-full h-13 rounded-xl text-base font-display font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: "oklch(0.28 0.12 268)",
            color: "white",
            boxShadow: "0 4px 16px oklch(0.28 0.12 268 / 0.3)",
          }}
        >
          Back to Home
        </Button>
      </motion.div>
    </main>
  );
}
