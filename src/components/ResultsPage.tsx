import { motion } from 'framer-motion';
import FraudRadar from './FraudRadar';
import EvidenceLedger from './EvidenceLedger';

interface ResultsPageProps {
  status: 'idle' | 'loading' | 'safe' | 'fraud';
  riskScore: number;
  amount: number;
  transactionType: 'TRANSFER' | 'CASH_OUT';
  senderOldBalance: number;
  senderNewBalance: number;
  receiverOldBalance: number;
  receiverNewBalance: number;
  hour: number;
  balanceDiscrepancy: number;
  onReAudit: () => void;
}

export default function ResultsPage({
  status,
  riskScore,
  amount,
  transactionType,
  senderOldBalance,
  senderNewBalance,
  hour,
  balanceDiscrepancy,
  onReAudit,
}: ResultsPageProps) {
  const isFraud = status === 'fraud';

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
            <span>RECORD #SF-8902</span>
            <span>·</span>
            <span>{transactionType}</span>
            <span>·</span>
            <span>${amount.toLocaleString()}</span>
            <span>·</span>
            <span>{hour.toString().padStart(2, '0')}:00 HRS</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="font-serif text-2xl text-[#2C2A29]">Audit Verdict</span>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${isFraud ? 'bg-[#B84A39]' : 'bg-[#3B7A57]'}`} />
              <span className={`font-semibold ${isFraud ? 'text-[#B84A39]' : 'text-[#3B7A57]'}`}>
                {isFraud ? 'CLASS 1 — FRAUDULENT' : 'CLASS 0 — SAFE'}
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

      {/* Main Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <FraudRadar
            status={status}
            riskScore={riskScore}
            amount={amount}
          />
        </div>

        <div className="lg:col-span-5 lg:border-l lg:border-[#E6E1D8] lg:pl-8">
          <EvidenceLedger
            status={status}
            amount={amount}
            balanceDiscrepancy={balanceDiscrepancy}
            senderOldBalance={senderOldBalance}
            senderNewBalance={senderNewBalance}
          />
        </div>
      </div>
    </motion.div>
  );
}
