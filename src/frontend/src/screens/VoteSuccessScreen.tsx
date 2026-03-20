import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onDone: () => void;
}

export default function VoteSuccessScreen({ onDone }: Props) {
  return (
    <main className="flex flex-col min-h-dvh items-center justify-center px-5 page-enter">
      {/* Outer glow ring */}
      <div className="relative flex items-center justify-center mb-8">
        <div
          className="absolute w-32 h-32 rounded-full pulse-ring"
          style={{ background: "oklch(0.65 0.18 158 / 0.15)" }}
        />
        <div
          className="absolute w-24 h-24 rounded-full pulse-ring"
          style={{
            background: "oklch(0.65 0.18 158 / 0.1)",
            animationDelay: "0.3s",
          }}
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.18 158), oklch(0.65 0.16 168))",
            boxShadow: "0 8px 32px oklch(0.65 0.18 158 / 0.4)",
          }}
        >
          <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2} />
        </motion.div>
      </div>

      {/* Text */}
      <motion.div
        data-ocid="vote_success.success_state"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-8"
      >
        <h1 className="font-display font-bold text-2xl text-foreground mb-3">
          Vote Submitted!
        </h1>
        <p className="font-body text-foreground/80 text-base leading-relaxed mb-2">
          Your vote has been successfully submitted.
        </p>
        <p className="font-body text-muted-foreground text-sm">
          Thank you for participating!
        </p>
      </motion.div>

      {/* Decorative divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-16 h-0.5 mb-8 rounded-full"
        style={{ background: "oklch(0.65 0.18 158)" }}
      />

      {/* Card with confirmation detail */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="w-full rounded-2xl px-5 py-4 mb-8 flex items-center gap-3"
        style={{
          background: "oklch(0.65 0.18 158 / 0.08)",
          border: "1.5px solid oklch(0.65 0.18 158 / 0.2)",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "oklch(0.65 0.18 158 / 0.15)" }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: "oklch(0.45 0.18 158)" }}
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <p className="text-sm font-body text-muted-foreground">
          Your vote is secure and recorded on the blockchain.
        </p>
      </motion.div>

      {/* Done button */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.55 }}
        className="w-full"
      >
        <Button
          data-ocid="vote_success.done_button"
          onClick={onDone}
          className="w-full h-13 rounded-xl text-base font-display font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: "oklch(0.28 0.12 268)",
            color: "white",
            boxShadow: "0 4px 16px oklch(0.28 0.12 268 / 0.3)",
          }}
        >
          Done
        </Button>
      </motion.div>
    </main>
  );
}
