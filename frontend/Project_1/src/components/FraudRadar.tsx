import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';

/* ───────────────────────── types ───────────────────────── */
interface FraudRadarProps {
  status: 'idle' | 'loading' | 'safe' | 'fraud';
  riskScore: number; // 0–100
  amount: number;
}

/* ───────────────────────── palette ───────────────────────── */
const CYAN = '#00F2FE';
const CRIMSON = '#FF0055';

/* ───────────────────────── helpers ───────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);

/* ─────────── random data‑dot generator (loading state) ──── */
interface Dot {
  id: number;
  x: number;
  y: number;
  delay: number;
}

function useRandomDots(active: boolean, count = 14): Dot[] {
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    if (!active) {
      setDots([]);
      return;
    }
    const make = () =>
      Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1.5,
      }));
    setDots(make());
    const id = setInterval(() => setDots(make()), 2400);
    return () => clearInterval(id);
  }, [active, count]);

  return dots;
}

/* ══════════════════════════════════════════════════════════
   SUB‑COMPONENTS
   ══════════════════════════════════════════════════════════ */

/* ─── Concentric radar rings ─────────────────────────────── */
const RING_SIZES = [120, 200, 280, 350];

function RadarRings({ pulse }: { pulse: boolean }) {
  return (
    <>
      {RING_SIZES.map((size, i) => (
        <motion.div
          key={size}
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: `rgba(0,242,254,${0.12 + i * 0.04})`,
          }}
          animate={
            pulse
              ? {
                  scale: [1, 1.06, 1],
                  opacity: [0.4, 0.8, 0.4],
                }
              : {
                  scale: 1,
                  opacity: 0.35 + i * 0.08,
                }
          }
          transition={
            pulse
              ? {
                  duration: 1.6,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: 'easeInOut',
                }
              : { duration: 0.6 }
          }
        />
      ))}
    </>
  );
}

/* ─── Rotating radar sweep ───────────────────────────────── */
function RadarSweep() {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 350,
        height: 350,
        background:
          'conic-gradient(from 0deg, transparent 0deg, transparent 330deg, rgba(0,242,254,0.25) 355deg, rgba(0,242,254,0.55) 360deg)',
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

/* ─── Scanning line (loading) ────────────────────────────── */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 w-full pointer-events-none"
      style={{
        height: 2,
        background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
        boxShadow: `0 0 12px ${CYAN}`,
      }}
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ─── Floating data dots (loading) ───────────────────────── */
function DataDots({ dots }: { dots: Dot[] }) {
  return (
    <>
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            left: `${d.x}%`,
            top: `${d.y}%`,
            backgroundColor: CYAN,
            boxShadow: `0 0 6px ${CYAN}`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
          transition={{
            duration: 1.8,
            delay: d.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}

/* ─── Risk bar ───────────────────────────────────────────── */
function RiskBar({
  riskScore,
  color,
}: {
  riskScore: number;
  color: string;
}) {
  return (
    <div className="w-full mt-5">
      <div className="flex justify-between text-xs mb-1.5 font-medium tracking-widest uppercase">
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>Low</span>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>High</span>
      </div>
      <div
        className="w-full h-2.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 14px ${color}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${riskScore}%` }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   VERDICT CARDS
   ══════════════════════════════════════════════════════════ */

function SafeVerdict({
  riskScore,
  amount,
}: {
  riskScore: number;
  amount: number;
}) {
  return (
    <motion.div
      key="safe-verdict"
      className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto rounded-2xl p-10"
      style={{
        background: 'rgba(0,242,254,0.04)',
        border: '1px solid rgba(0,242,254,0.25)',
        boxShadow: '0 0 30px rgba(0,242,254,0.3), inset 0 0 40px rgba(0,242,254,0.03)',
        backdropFilter: 'blur(20px)',
      }}
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {/* ambient glow behind card */}
      <div
        className="absolute -inset-16 -z-10 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,242,254,0.12) 0%, transparent 70%)' }}
      />

      <span className="text-5xl mb-3">✅</span>

      <h2
        className="text-2xl md:text-3xl font-extrabold tracking-wide text-center"
        style={{ color: CYAN }}
      >
        LEGITIMATE TRANSACTION
      </h2>

      <p className="mt-2 text-sm tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Transaction within normal parameters
      </p>

      {/* risk score */}
      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-5xl font-black tabular-nums" style={{ color: CYAN }}>
          <CountUp end={riskScore} duration={2} decimals={1} />
        </span>
        <span className="text-lg font-semibold" style={{ color: 'rgba(0,242,254,0.7)' }}>
          % Risk
        </span>
      </div>

      <RiskBar riskScore={riskScore} color={CYAN} />

      {/* amount */}
      <div className="mt-6 text-center">
        <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Transaction Amount
        </p>
        <p className="text-xl font-bold mt-1 tabular-nums" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {fmt(amount)}
        </p>
      </div>
    </motion.div>
  );
}

function FraudVerdict({
  riskScore,
  amount,
}: {
  riskScore: number;
  amount: number;
}) {
  return (
    <motion.div
      key="fraud-verdict"
      className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto rounded-2xl p-10"
      style={{
        background: 'rgba(255,0,85,0.05)',
        border: '1px solid rgba(255,0,85,0.35)',
        backdropFilter: 'blur(20px)',
      }}
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        x: [0, -10, 10, -10, 10, 0],
        boxShadow: [
          '0 0 20px rgba(255,0,85,0.25)',
          '0 0 40px rgba(255,0,85,0.5)',
          '0 0 20px rgba(255,0,85,0.25)',
        ],
      }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{
        duration: 0.5,
        ease: 'easeOut',
        x: { duration: 0.5, ease: 'easeInOut' },
        boxShadow: {
          duration: 1.6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        },
      }}
    >
      {/* pulsing red ambient glow */}
      <motion.div
        className="absolute -inset-20 -z-10 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,0,85,0.18) 0%, transparent 70%)' }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <span className="text-5xl mb-3">🚨</span>

      <h2
        className="text-2xl md:text-3xl font-extrabold tracking-wide text-center leading-tight"
        style={{ color: CRIMSON }}
      >
        CRITICAL RISK:
        <br />
        FRAUD SUSPECTED
      </h2>

      <p className="mt-2 text-sm tracking-wider text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Anomalous pattern detected in transaction ledger
      </p>

      {/* risk score */}
      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-5xl font-black tabular-nums" style={{ color: CRIMSON }}>
          <CountUp end={riskScore} duration={2} decimals={1} />
        </span>
        <span className="text-lg font-semibold" style={{ color: 'rgba(255,0,85,0.7)' }}>
          % Risk
        </span>
      </div>

      <RiskBar riskScore={riskScore} color={CRIMSON} />

      {/* amount */}
      <div className="mt-6 text-center">
        <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Transaction Amount
        </p>
        <p className="text-xl font-bold mt-1 tabular-nums" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {fmt(amount)}
        </p>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function FraudRadar({ status, riskScore, amount }: FraudRadarProps) {
  const dots = useRandomDots(status === 'loading');

  /* We key AnimatePresence children by status so transitions work cleanly */
  const verdictKey = useMemo(() => {
    if (status === 'safe' || status === 'fraud') return status;
    return 'radar';
  }, [status]);

  return (
    <section
      className="relative flex flex-col items-center justify-center w-full h-full min-h-[520px] overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ─── ambient background breathing glow ─── */}
      <motion.div
        className="absolute inset-0 -z-20 pointer-events-none"
        animate={{
          background:
            status === 'fraud'
              ? 'radial-gradient(ellipse at center, rgba(255,0,85,0.06) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(0,242,254,0.04) 0%, transparent 70%)',
        }}
        transition={{ duration: 1 }}
      />

      <AnimatePresence mode="wait">
        {/* ════════════════════ IDLE ════════════════════ */}
        {status === 'idle' && (
          <motion.div
            key="radar"
            className="relative flex flex-col items-center justify-center"
            style={{ width: 380, height: 380 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.45 }}
          >
            <RadarSweep />
            <RadarRings pulse={false} />

            {/* center text */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 text-center px-6">
              <motion.p
                className="text-xs font-semibold tracking-[0.25em] uppercase"
                style={{ color: 'rgba(0,242,254,0.6)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                Awaiting Transaction Data
              </motion.p>
              <p
                className="text-[11px] tracking-wider"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                Configure parameters and initiate audit
              </p>
            </div>
          </motion.div>
        )}

        {/* ════════════════════ LOADING ════════════════════ */}
        {status === 'loading' && (
          <motion.div
            key="loading"
            className="relative flex flex-col items-center justify-center"
            style={{ width: 380, height: 380 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.4 }}
          >
            <RadarSweep />
            <RadarRings pulse />
            <ScanLine />
            <DataDots dots={dots} />

            {/* center text */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 text-center px-4">
              <motion.p
                className="text-xs font-bold tracking-[0.2em] uppercase"
                style={{ color: CYAN }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Analyzing Transaction Patterns…
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* ════════════════════ SAFE ════════════════════ */}
        {status === 'safe' && (
          <SafeVerdict key="safe" riskScore={riskScore} amount={amount} />
        )}

        {/* ════════════════════ FRAUD ════════════════════ */}
        {status === 'fraud' && (
          <FraudVerdict key="fraud" riskScore={riskScore} amount={amount} />
        )}
      </AnimatePresence>
    </section>
  );
}
