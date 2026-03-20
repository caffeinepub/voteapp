import { Button } from "@/components/ui/button";
import { ShieldCheck, Vote } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onVoterLogin: () => void;
  onAdminLogin: () => void;
}

export default function HomeScreen({ onVoterLogin, onAdminLogin }: Props) {
  return (
    <main className="flex flex-col min-h-dvh page-enter">
      {/* Hero section */}
      <div className="vote-hero noise-bg relative flex flex-col items-center justify-center px-6 pt-16 pb-12 overflow-hidden">
        {/* Background decorative elements */}
        <div
          className="absolute top-8 right-6 w-24 h-24 rounded-full opacity-10"
          style={{ background: "oklch(0.72 0.16 195)" }}
        />
        <div
          className="absolute bottom-4 left-4 w-16 h-16 rounded-full opacity-8"
          style={{ background: "oklch(0.78 0.18 85)" }}
        />
        <div
          className="absolute top-1/2 left-0 w-1 h-20 opacity-20"
          style={{
            background:
              "linear-gradient(to bottom, transparent, oklch(0.72 0.16 195), transparent)",
          }}
        />

        {/* Floating logo */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-6"
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl opacity-30 blur-xl"
              style={{ background: "oklch(0.72 0.16 195)" }}
            />
            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-hero"
              style={{
                background: "oklch(1 0 0 / 0.12)",
                border: "1px solid oklch(1 0 0 / 0.2)",
              }}
            >
              <img
                src="/assets/generated/vote-logo-transparent.dim_80x80.png"
                alt="VoteApp"
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h1 className="font-display font-bold text-4xl tracking-tight text-white mb-1">
            VoteApp
          </h1>
          <p className="text-white/70 text-sm font-body font-medium tracking-wide uppercase">
            Secure · Fast · Transparent
          </p>
        </motion.div>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 w-12 h-px"
          style={{ background: "oklch(0.72 0.16 195)" }}
        />
      </div>

      {/* Action section */}
      <div className="flex-1 flex flex-col px-5 py-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-center text-muted-foreground text-sm mb-6 font-body">
            Choose your role to get started
          </p>

          {/* Voter Login Button */}
          <button
            type="button"
            data-ocid="home.voter_login_button"
            onClick={onVoterLogin}
            className="w-full rounded-xl p-5 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:shadow-card-hover shadow-card"
            style={{
              background: "oklch(var(--card))",
              border: "1.5px solid oklch(var(--border))",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.28 0.12 268 / 0.1)" }}
              >
                <Vote
                  className="w-6 h-6"
                  style={{ color: "oklch(0.28 0.12 268)" }}
                />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-foreground text-base">
                  Cast Your Vote
                </p>
                <p className="text-muted-foreground text-sm mt-0.5 font-body">
                  Login with your Voter ID
                </p>
              </div>
              <div className="text-muted-foreground/50" aria-hidden="true">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Admin Login Button */}
          <button
            type="button"
            data-ocid="home.admin_login_button"
            onClick={onAdminLogin}
            className="w-full rounded-xl p-5 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] hover:shadow-card-hover shadow-card"
            style={{
              background: "oklch(var(--card))",
              border: "1.5px solid oklch(var(--border))",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.72 0.16 195 / 0.12)" }}
              >
                <ShieldCheck
                  className="w-6 h-6"
                  style={{ color: "oklch(0.55 0.16 195)" }}
                />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-foreground text-base">
                  Admin Panel
                </p>
                <p className="text-muted-foreground text-sm mt-0.5 font-body">
                  Manage voters &amp; view results
                </p>
              </div>
              <div className="text-muted-foreground/50" aria-hidden="true">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Info pill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-2 flex items-center justify-center gap-2"
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "oklch(0.72 0.16 195)" }}
          />
          <p className="text-xs text-muted-foreground font-body">
            Each voter can cast exactly one vote
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="pb-6 px-5 text-center">
        <p className="text-xs text-muted-foreground/60 font-body">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>
    </main>
  );
}
