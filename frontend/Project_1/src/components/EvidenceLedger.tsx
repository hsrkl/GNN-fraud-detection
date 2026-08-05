import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EvidenceLedgerProps {
  status: 'idle' | 'loading' | 'safe' | 'fraud';
  amount: number;
  balanceDiscrepancy: number;
  senderOldBalance: number;
  senderNewBalance: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CYAN = '#00F2FE';
const RED = '#FF0055';
const GREEN = '#22C55E';
const MUTED = '#64748B';

interface MetricDef {
  label: string;
  value: number;
  pct: number;
  primary?: boolean;
}

const METRICS: MetricDef[] = [
  { label: 'Recall', value: 0.997, pct: 99.7, primary: true },
  { label: 'F1-Score', value: 0.863, pct: 86.3 },
  { label: 'Precision', value: 0.758, pct: 75.8 },
];

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

interface TooltipPayloadEntry {
  name?: string;
  value?: number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomBarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A]/90 px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="mb-1 text-xs font-semibold tracking-wide text-[#94A3B8]">
        {label}
      </p>
      {payload.map((entry, i) => (
        <p key={i} className="font-mono text-sm" style={{ color: entry.color }}>
          {entry.name}: ${entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Section heading */
function SectionTitle() {
  return (
    <div className="mb-6">
      <h2 className="font-mono text-sm font-bold tracking-[0.25em] text-white/90">
        EVIDENCE LEDGER
      </h2>
      <div
        className="mt-1.5 h-[1px] w-full"
        style={{
          background: `linear-gradient(90deg, ${CYAN}, transparent)`,
        }}
      />
    </div>
  );
}

/** Idle placeholder for the chart area */
function ChartPlaceholder() {
  return (
    <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-[#1E293B] bg-[#111827]/30">
      <p className="font-mono text-xs tracking-wide text-[#475569]">
        Transaction analysis will appear here
      </p>
    </div>
  );
}

/** Recharts balance flow chart + insight text */
function BalanceFlowChart({
  amount,
  balanceDiscrepancy,
  status,
}: {
  amount: number;
  balanceDiscrepancy: number;
  status: 'safe' | 'fraud';
}) {
  const absDiscrepancy = Math.abs(balanceDiscrepancy);
  const discrepancyColor = absDiscrepancy > 0 ? RED : GREEN;

  const data = [
    { name: 'Amount Transferred', value: amount },
    { name: 'Balance Discrepancy', value: absDiscrepancy },
  ];

  const barColors = [CYAN, discrepancyColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mb-6"
    >
      {/* Chart title */}
      <p className="mb-3 font-mono text-[11px] font-semibold tracking-[0.2em] text-[#94A3B8]">
        BALANCE FLOW ANALYSIS
      </p>

      {/* Chart container */}
      <div className="rounded-xl border border-[#1E293B] bg-[#111827]/40 p-4 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            barCategoryGap="30%"
          >
            <XAxis
              dataKey="name"
              tick={{ fill: MUTED, fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: MUTED, fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
              }
            />
            <Tooltip
              content={<CustomBarTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={800}>
              {data.map((_entry, idx) => (
                <Cell key={idx} fill={barColors[idx]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
          status === 'fraud'
            ? 'border-[#FF0055]/20 bg-[#FF0055]/5 text-[#FF6B8A]'
            : 'border-[#22C55E]/20 bg-[#22C55E]/5 text-[#4ADE80]'
        }`}
      >
        {status === 'fraud'
          ? '⚠️ Critical: Balance change does not match transferred amount — classic money laundering indicator'
          : '✓ Balance changes are consistent with the transaction amount'}
      </motion.p>
    </motion.div>
  );
}

/** Single metric card */
function MetricCard({
  metric,
  index,
  dimmed,
}: {
  metric: MetricDef;
  index: number;
  dimmed: boolean;
}) {
  const barColor = metric.primary ? CYAN : '#6366F1';

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: dimmed ? 0.5 : 1, x: 0 }}
      transition={{ delay: 0.15 * index, duration: 0.45, ease: 'easeOut' }}
      className={`relative rounded-xl border bg-[#111827]/60 p-4 backdrop-blur-sm transition-colors ${
        metric.primary
          ? 'border-[#00F2FE]/30 shadow-[0_0_20px_rgba(0,242,254,0.08)]'
          : 'border-[#1E293B]'
      }`}
    >
      {/* Primary badge */}
      {metric.primary && (
        <span className="absolute right-3 top-3 rounded-full border border-[#00F2FE]/30 bg-[#00F2FE]/10 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-[#00F2FE]">
          PRIMARY
        </span>
      )}

      {/* Label */}
      <p className="mb-1 text-[11px] font-medium tracking-wide text-[#64748B]">
        {metric.label}
      </p>

      {/* Value */}
      <p
        className="font-mono text-2xl font-bold"
        style={{ color: metric.primary ? CYAN : '#E2E8F0' }}
      >
        {dimmed ? (
          `${metric.pct.toFixed(1)}%`
        ) : (
          <CountUp
            end={metric.pct}
            decimals={1}
            duration={1.6}
            delay={0.2 * index}
            suffix="%"
          />
        )}
      </p>

      {/* Raw value */}
      <p className="mt-0.5 font-mono text-[10px] text-[#475569]">
        {metric.value.toFixed(3)}
      </p>

      {/* Progress bar */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#1E293B]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: dimmed ? `${metric.pct}%` : `${metric.pct}%` }}
          transition={{
            delay: dimmed ? 0 : 0.3 + 0.15 * index,
            duration: dimmed ? 0 : 1,
            ease: 'easeOut',
          }}
          className="h-full rounded-full"
          style={{
            background: metric.primary
              ? `linear-gradient(90deg, ${CYAN}, #6366F1)`
              : `linear-gradient(90deg, #6366F1, #818CF8)`,
          }}
        />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function EvidenceLedger({
  status,
  amount,
  balanceDiscrepancy,
}: EvidenceLedgerProps) {
  const showChart = status === 'safe' || status === 'fraud';
  const isDimmed = status === 'idle';

  return (
    <section className="flex h-full flex-col overflow-y-auto pr-1">
      <SectionTitle />

      {/* Chart / Placeholder area */}
      <AnimatePresence mode="wait">
        {showChart ? (
          <BalanceFlowChart
            key="chart"
            amount={amount}
            balanceDiscrepancy={balanceDiscrepancy}
            status={status}
          />
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <ChartPlaceholder />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model Performance Metrics */}
      <p className="mb-3 font-mono text-[11px] font-semibold tracking-[0.2em] text-[#94A3B8]">
        MODEL PERFORMANCE METRICS
      </p>

      <div className="flex flex-col gap-3">
        {METRICS.map((metric, i) => (
          <MetricCard key={metric.label} metric={metric} index={i} dimmed={isDimmed} />
        ))}
      </div>
    </section>
  );
}
