import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InputHubProps {
  transactionType: 'TRANSFER' | 'CASH_OUT';
  setTransactionType: (t: 'TRANSFER' | 'CASH_OUT') => void;
  amount: number;
  setAmount: (n: number) => void;
  senderOldBalance: number;
  setSenderOldBalance: (n: number) => void;
  senderNewBalance: number;
  setSenderNewBalance: (n: number) => void;
  receiverOldBalance: number;
  setReceiverOldBalance: (n: number) => void;
  receiverNewBalance: number;
  setReceiverNewBalance: (n: number) => void;
  hour: number;
  setHour: (n: number) => void;
  onAudit: () => void;
  isLoading: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const usd = (v: number) =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const padHour = (h: number) => `${String(h).padStart(2, '0')}:00`;

const PRESETS: { label: string; value: number }[] = [
  { label: '$100', value: 100 },
  { label: '$10K', value: 10_000 },
  { label: '$100K', value: 100_000 },
  { label: 'Max', value: 500_000 },
];

const TIME_TICKS = [0, 6, 12, 18, 23];

/* ------------------------------------------------------------------ */
/*  Stagger animation variants                                         */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** Tiny section heading with a cyan underline accent */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="font-mono text-[10px] tracking-[0.25em] uppercase text-gray-400">
        {children}
      </h3>
      <div className="mt-1.5 h-[1px] w-10 bg-gradient-to-r from-[#00F2FE] to-transparent" />
    </div>
  );
}

/** Styled number input cell for the balance matrix */
function BalanceInput({
  label,
  value,
  onChange,
  dashed = false,
  readOnly = false,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange?: (v: number) => void;
  dashed?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = e.target.value;
    if (val === '') {
      onChange?.(0);
    } else {
      // Number(val) strips leading zeros (e.g. "01000" -> 1000)
      onChange?.(Number(val));
    }
  };

  // When disabled, display 0. When focused and value is 0, show empty string so entering new numbers replaces 0
  const displayValue = disabled ? 0 : focused && value === 0 ? '' : isNaN(value) ? '' : value;

  return (
    <div className={`flex flex-col gap-1.5 transition-all duration-300 ${disabled ? 'opacity-50 select-none' : ''}`}>
      <div className="flex h-4 items-center justify-between gap-1">
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-gray-400 truncate">
          {label}
        </span>
        {disabled ? (
          <span className="font-mono text-[7px] font-semibold tracking-wider text-rose-400 uppercase px-1 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 leading-none whitespace-nowrap">
            NOT APPLICABLE FOR CASH_OUT
          </span>
        ) : dashed ? (
          <span className="font-mono text-[8px] tracking-wider text-[#00F2FE] uppercase px-1 py-0.5 rounded bg-[#00F2FE]/10 leading-none">
            AUTO
          </span>
        ) : null}
      </div>
      <div
        className={`
          flex items-center rounded-lg bg-[#0D1320] px-3 py-2.5
          transition-all duration-300
          ${
            disabled
              ? 'border border-gray-800 bg-black/40 cursor-not-allowed'
              : dashed
              ? 'border border-dashed border-[#00F2FE]/40'
              : 'border border-[#1E293B]'
          }
          ${
            focused && !disabled
              ? 'border-[#00F2FE]/60 shadow-[0_0_12px_rgba(0,242,254,0.15)] ring-1 ring-[#00F2FE]/30'
              : ''
          }
        `}
      >
        <span className={`mr-1.5 select-none font-mono text-sm font-semibold ${disabled ? 'text-gray-600' : 'text-[#00F2FE]'}`}>
          $
        </span>
        <input
          type="number"
          disabled={disabled}
          readOnly={readOnly || disabled}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => !disabled && setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full min-w-0 bg-transparent font-mono text-sm text-gray-100
            outline-none border-none p-0 focus:outline-none focus:ring-0
            ${disabled ? 'cursor-not-allowed text-gray-500' : readOnly ? 'cursor-default text-[#00F2FE]/90' : ''}
          `}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function InputHub({
  transactionType,
  setTransactionType,
  amount,
  setAmount,
  senderOldBalance,
  setSenderOldBalance,
  senderNewBalance,
  setSenderNewBalance,
  receiverOldBalance,
  setReceiverOldBalance,
  receiverNewBalance,
  setReceiverNewBalance,
  hour,
  setHour,
  onAudit,
  isLoading,
}: InputHubProps) {
  const glowIntensity = amount / 500_000;
  const [amountFocused, setAmountFocused] = useState(false);
  const isCashOut = transactionType === 'CASH_OUT';

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setAmount(0);
    } else {
      setAmount(Number(val));
    }
  };

  const displayAmountValue = amountFocused && amount === 0 ? '' : isNaN(amount) ? '' : amount;

  return (
    <motion.aside
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="
        flex h-full flex-col gap-7 overflow-y-auto
        rounded-2xl border border-white/[0.04]
        bg-[#0A0F1A]/70 p-6 backdrop-blur-xl
        scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-900/30
        shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_0_40px_rgba(0,242,254,0.03)]
      "
    >
      {/* ───────────── Section Title ───────────── */}
      <motion.div variants={sectionVariants}>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#00F2FE] shadow-[0_0_6px_#00F2FE]" />
          <h2 className="font-mono text-[11px] font-semibold tracking-[0.3em] uppercase text-gray-300">
            Transaction Parameters
          </h2>
        </div>
        <div className="mt-2 h-[1px] w-full bg-gradient-to-r from-[#00F2FE]/50 via-[#00F2FE]/10 to-transparent" />
      </motion.div>

      {/* ───────────── Transaction Type ───────────── */}
      <motion.div variants={sectionVariants}>
        <SectionHeading>Type</SectionHeading>

        <div className="relative flex rounded-xl bg-[#0D1320] p-1">
          {(['TRANSFER', 'CASH_OUT'] as const).map((t) => {
            const active = transactionType === t;
            return (
              <button
                key={t}
                onClick={() => setTransactionType(t)}
                className={`
                  relative z-10 flex-1 rounded-lg py-2.5 font-mono text-xs tracking-wider transition-colors duration-200
                  ${active ? 'text-[#00F2FE]' : 'text-gray-500 hover:text-gray-300'}
                `}
              >
                {active && (
                  <motion.div
                    layoutId="txType"
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00F2FE]/[0.12] to-[#00F2FE]/[0.04] shadow-[0_0_14px_rgba(0,242,254,0.08)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{t.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ───────────── Transaction Amount ───────────── */}
      <motion.div variants={sectionVariants}>
        <SectionHeading>Transaction Amount</SectionHeading>

        {/* Direct Manual Numeric Input */}
        <div
          className={`
            mb-3 flex items-center rounded-xl bg-[#0D1320] px-4 py-2
            border transition-all duration-300
            ${
              amountFocused
                ? 'border-[#00F2FE]/70 shadow-[0_0_16px_rgba(0,242,254,0.2)] ring-1 ring-[#00F2FE]/30'
                : 'border-[#1E293B]'
            }
          `}
        >
          <span className="mr-1.5 select-none font-mono text-3xl font-bold text-[#00F2FE] drop-shadow-[0_0_12px_rgba(0,242,254,0.35)]">
            $
          </span>
          <input
            type="number"
            min={0}
            value={displayAmountValue}
            onChange={handleAmountInputChange}
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
            placeholder="0"
            className="w-full bg-transparent font-mono text-3xl font-bold text-[#00F2FE] outline-none border-none p-0 focus:outline-none focus:ring-0 placeholder-gray-600 drop-shadow-[0_0_12px_rgba(0,242,254,0.35)]"
          />
        </div>

        {/* Range slider */}
        <div
          className="group relative"
          style={{ '--glow-intensity': Math.min(1, glowIntensity) } as React.CSSProperties}
        >
          <input
            type="range"
            min={0}
            max={500_000}
            step={1000}
            value={Math.min(500_000, amount)}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="amount-slider w-full cursor-pointer appearance-none bg-transparent"
          />
          {/* Glow bar behind slider track */}
          <div
            className="pointer-events-none absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
            style={{
              width: `${Math.min(100, (amount / 500_000) * 100)}%`,
              background: `linear-gradient(90deg, #00F2FE44, #00F2FE)`,
              boxShadow: `0 0 ${8 + Math.min(1, glowIntensity) * 20}px rgba(0,242,254,${0.15 + Math.min(1, glowIntensity) * 0.45})`,
              transition: 'width 80ms ease, box-shadow 150ms ease',
            }}
          />
        </div>

        {/* Presets */}
        <div className="mt-3 flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setAmount(p.value)}
              className={`
                flex-1 rounded-full border py-1.5
                font-mono text-[10px] tracking-wider transition-all duration-200
                ${
                  amount === p.value
                    ? 'border-[#00F2FE] bg-[#00F2FE]/15 text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.2)] font-semibold'
                    : 'border-[#1E293B] bg-[#0D1320] text-gray-400 hover:border-[#00F2FE]/40 hover:text-[#00F2FE]'
                }
              `}
            >
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ───────────── Balance Matrix ───────────── */}
      <motion.div variants={sectionVariants}>
        <SectionHeading>Balance Matrix</SectionHeading>

        <div className="grid grid-cols-2 gap-3">
          <BalanceInput
            label="Sender Origin"
            value={senderOldBalance}
            onChange={setSenderOldBalance}
          />
          <BalanceInput
            label="Sender Result"
            value={senderNewBalance}
            onChange={setSenderNewBalance}
            dashed
          />
          <BalanceInput
            label="Receiver Origin"
            value={isCashOut ? 0 : receiverOldBalance}
            onChange={setReceiverOldBalance}
            disabled={isCashOut}
          />
          <BalanceInput
            label="Receiver Result"
            value={isCashOut ? 0 : receiverNewBalance}
            onChange={setReceiverNewBalance}
            disabled={isCashOut}
          />
        </div>
      </motion.div>

      {/* ───────────── Time Selector ───────────── */}
      <motion.div variants={sectionVariants}>
        <SectionHeading>Transaction Hour</SectionHeading>

        <div className="flex items-baseline gap-3">
          <span className="font-mono text-3xl font-bold text-gray-100 tabular-nums">
            {padHour(hour)}
          </span>
          <span className="font-mono text-[10px] tracking-wider text-gray-500 uppercase">
            {hour < 6 ? 'Night' : hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'}
          </span>
        </div>

        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={23}
            step={1}
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="hour-slider w-full cursor-pointer appearance-none bg-transparent"
          />
          {/* Tick marks */}
          <div className="mt-1 flex justify-between px-0.5">
            {TIME_TICKS.map((t) => (
              <span
                key={t}
                className={`font-mono text-[9px] ${
                  hour === t ? 'text-[#00F2FE]' : 'text-gray-600'
                }`}
              >
                {String(t).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ───────────── Audit Button ───────────── */}
      <motion.div variants={sectionVariants} className="mt-auto pt-2">
        <motion.button
          onClick={onAudit}
          disabled={isLoading}
          whileHover={isLoading ? {} : { scale: 1.02 }}
          whileTap={isLoading ? {} : { scale: 0.98 }}
          className={`
            group relative w-full overflow-hidden rounded-xl border
            px-6 py-4 font-mono text-xs font-semibold tracking-[0.15em] uppercase
            transition-all duration-300
            ${
              isLoading
                ? 'cursor-wait border-gray-700 bg-gray-900/60 text-gray-500'
                : 'border-[#00F2FE]/30 bg-gradient-to-r from-cyan-500/[0.08] to-blue-500/[0.08] text-[#00F2FE] hover:border-[#00F2FE]/60 hover:shadow-[0_0_24px_rgba(0,242,254,0.12)]'
            }
          `}
        >
          {/* Shimmer overlay */}
          {!isLoading && (
            <span
              className="
                pointer-events-none absolute inset-0
                bg-[length:200%_100%] bg-[linear-gradient(110deg,transparent_25%,rgba(0,242,254,0.06)_50%,transparent_75%)]
                animate-[shimmer_2.5s_ease-in-out_infinite]
              "
            />
          )}

          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                {/* Spinner */}
                <svg
                  className="h-4 w-4 animate-spin text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Analyzing Features…
              </>
            ) : (
              <>🚨&ensp;Initiate Real-Time Ledger Audit</>
            )}
          </span>
        </motion.button>
      </motion.div>

      {/* ───────────── Inline Styles ───────────── */}
      <style>{`
        /* ── Shimmer keyframe ── */
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Amount Slider ── */
        .amount-slider::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 9999px;
          background: #1E293B;
        }
        .amount-slider::-moz-range-track {
          height: 4px;
          border-radius: 9999px;
          background: #1E293B;
        }
        .amount-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #00F2FE;
          border: 2px solid #080C14;
          margin-top: -7px;
          box-shadow: 0 0 10px rgba(0,242,254,0.5), 0 0 20px rgba(0,242,254,0.2);
          cursor: pointer;
          transition: box-shadow 0.2s ease;
        }
        .amount-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #00F2FE;
          border: 2px solid #080C14;
          box-shadow: 0 0 10px rgba(0,242,254,0.5), 0 0 20px rgba(0,242,254,0.2);
          cursor: pointer;
          transition: box-shadow 0.2s ease;
        }
        .amount-slider:hover::-webkit-slider-thumb {
          box-shadow: 0 0 14px rgba(0,242,254,0.7), 0 0 30px rgba(0,242,254,0.3);
        }
        .amount-slider:hover::-moz-range-thumb {
          box-shadow: 0 0 14px rgba(0,242,254,0.7), 0 0 30px rgba(0,242,254,0.3);
        }

        /* ── Hour Slider ── */
        .hour-slider::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #1a1040, #1E293B 30%, #1E293B 70%, #1a1040);
        }
        .hour-slider::-moz-range-track {
          height: 4px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #1a1040, #1E293B 30%, #1E293B 70%, #1a1040);
        }
        .hour-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #e2e8f0;
          border: 2px solid #080C14;
          margin-top: -6px;
          box-shadow: 0 0 8px rgba(226,232,240,0.3);
          cursor: pointer;
          transition: box-shadow 0.2s ease;
        }
        .hour-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #e2e8f0;
          border: 2px solid #080C14;
          box-shadow: 0 0 8px rgba(226,232,240,0.3);
          cursor: pointer;
          transition: box-shadow 0.2s ease;
        }
        .hour-slider:hover::-webkit-slider-thumb {
          box-shadow: 0 0 12px rgba(0,242,254,0.5);
          background: #00F2FE;
        }
        .hour-slider:hover::-moz-range-thumb {
          box-shadow: 0 0 12px rgba(0,242,254,0.5);
          background: #00F2FE;
        }

        /* ── Hide number input spinners ── */
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </motion.aside>
  );
}
