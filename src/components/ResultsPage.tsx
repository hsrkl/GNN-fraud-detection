import { motion } from 'framer-motion';
import FraudRadar from './FraudRadar';
import EvidenceLedger from './EvidenceLedger';
import type { ApiResult, ChipType, ErrorType } from '../App';

interface ResultsPageProps {
  status: 'idle' | 'loading' | 'safe' | 'fraud';
  apiResult: ApiResult | null;
  amount: string;
  useChip: ChipType;
  errors: ErrorType;
  time: string;
  apiError: string | null;
  onReAudit: () => void;
}

export default function ResultsPage({
  status,
  apiResult,
  amount,
  useChip,
  errors,
  time,
  apiError,
  onReAudit,
}: ResultsPageProps) {
  const isFraud = status === 'fraud';
  const probability = apiResult?.probability ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl mx-auto pt-6 pb-20 space-y-8"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1D8] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-xs font-mono text-[#78726A]">
            <span>RECORD #SF-{Math.floor(Math.random() * 9000 + 1000)}</span>
            <span>·</span>
            <span>{useChip}</span>
            <span>·</span>
            <span>{amount}</span>
            <span>·</span>
            <span>{time || '—'} HRS</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="font-serif text-2xl text-[#2C2A29]">Audit Verdict</span>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${isFraud ? 'bg-[#B84A39]' : 'bg-[#3B7A57]'}`} />
              <span className={`font-semibold ${isFraud ? 'text-[#B84A39]' : 'text-[#3B7A57]'}`}>
                {isFraud ? 'FRAUDULENT' : 'SAFE'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onReAudit}
          className="self-start sm:self-center text-xs font-medium text-[#C85A32] hover:underline cursor-pointer border-none bg-transparent p-0"
        >
          ← Adjust & Re-Audit
        </button>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className="border border-[#E6E1D8] bg-[#FBF0EF] p-4 text-xs font-mono text-[#B84A39] space-y-1">
          <div className="font-semibold">⚠ API Connection Failed</div>
          <div className="text-[#78726A]">{apiError}</div>
          <div className="text-[#A0988E] italic">Showing fallback heuristic result below.</div>
        </div>
      )}

      {/* Main Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <FraudRadar
            status={status}
            probability={probability}
            threshold={apiResult?.threshold ?? 0.25}
            amount={amount}
            customerKnown={apiResult?.customer_known ?? true}
            merchantKnown={apiResult?.merchant_known ?? true}
          />
        </div>

        <div className="lg:col-span-5 lg:border-l lg:border-[#E6E1D8] lg:pl-8">
          <EvidenceLedger
            status={status}
            probability={probability}
            threshold={apiResult?.threshold ?? 0.25}
            customerKnown={apiResult?.customer_known ?? true}
            merchantKnown={apiResult?.merchant_known ?? true}
            amount={amount}
            useChip={useChip}
            errors={errors}
          />
        </div>
      </div>
    </motion.div>
  );
}
