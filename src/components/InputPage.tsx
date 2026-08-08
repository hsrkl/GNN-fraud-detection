import { motion } from 'framer-motion';
import InputHub from './InputHub';

interface InputPageProps {
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

export default function InputPage({
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
}: InputPageProps) {

  const applyPreset = (preset: {
    type: 'TRANSFER' | 'CASH_OUT';
    amt: number;
    sOld: number;
    rOld: number;
    hr: number;
  }) => {
    setTransactionType(preset.type);
    setAmount(preset.amt);
    setSenderOldBalance(preset.sOld);
    if (preset.type === 'CASH_OUT') {
      setReceiverOldBalance(0);
      setReceiverNewBalance(0);
    } else {
      setReceiverOldBalance(preset.rOld);
      setReceiverNewBalance(preset.rOld + preset.amt);
    }
    setSenderNewBalance(Math.max(0, preset.sOld - preset.amt));
    setHour(preset.hr);
  };

  const PRESETS = [
    {
      name: 'Routine Transfer',
      desc: 'Daytime peer-to-peer',
      dotColor: '#3B7A57',
      dotLabel: 'SAFE',
      type: 'TRANSFER' as const,
      amt: 2500,
      sOld: 50000,
      rOld: 12000,
      hr: 14,
    },
    {
      name: 'Account Drain',
      desc: 'Complete balance drain',
      dotColor: '#B84A39',
      dotLabel: 'HIGH RISK',
      type: 'CASH_OUT' as const,
      amt: 250000,
      sOld: 250000,
      rOld: 0,
      hr: 2,
    },
    {
      name: 'Balance Anomaly',
      desc: 'Zero-destination record',
      dotColor: '#A86B24',
      dotLabel: 'ANOMALY',
      type: 'TRANSFER' as const,
      amt: 450000,
      sOld: 500000,
      rOld: 0,
      hr: 23,
    },
  ];

  const discrepancy = senderOldBalance - senderNewBalance - amount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl mx-auto pt-6 pb-20 space-y-12"
    >
      {/* Editorial Header */}
      <div className="space-y-4 border-b border-[#E6E1D8] pb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#78726A] tracking-wider uppercase">
          <span>CHAPTER 01</span>
          <span>—</span>
          <span>PARAMETERS & INFERENCE SETUP</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2A29] font-normal leading-tight">
          Transaction Audit Setup
        </h1>

        <p className="text-sm text-[#78726A] max-w-2xl leading-relaxed">
          Configure financial parameters, account balance deltas, and timestamp vectors to evaluate transactions against your live XGBoost fraud detection model.
        </p>

        {/* Preset Scenarios - Text Labels with Colored Dots */}
        <div className="pt-3 flex flex-wrap items-center gap-6">
          <span className="text-xs font-semibold text-[#78726A] tracking-wider uppercase">
            PRESETS:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="flex items-center gap-2 text-xs text-[#2C2A29] hover:text-[#C85A32] transition-colors cursor-pointer border-none bg-transparent p-0"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: p.dotColor }}
              />
              <span className="font-medium">{p.name}</span>
              <span className="text-[#A0988E] font-mono text-[11px]">
                (${p.amt.toLocaleString()})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Flow Layout - Loosely Spaced Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7">
          <InputHub
            transactionType={transactionType}
            setTransactionType={setTransactionType}
            amount={amount}
            setAmount={setAmount}
            senderOldBalance={senderOldBalance}
            setSenderOldBalance={setSenderOldBalance}
            senderNewBalance={senderNewBalance}
            setSenderNewBalance={setSenderNewBalance}
            receiverOldBalance={receiverOldBalance}
            setReceiverOldBalance={setReceiverOldBalance}
            receiverNewBalance={receiverNewBalance}
            setReceiverNewBalance={setReceiverNewBalance}
            hour={hour}
            setHour={setHour}
            onAudit={onAudit}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Feature Vector & Knowledge Base (5 cols) */}
        <div className="lg:col-span-5 space-y-10 lg:border-l lg:border-[#E6E1D8] lg:pl-10">
          {/* Feature Vector Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
              Vector Summary
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-baseline border-b border-[#EDE9E1] pb-2">
                <span className="text-[#78726A]">Type</span>
                <span className="text-[#2C2A29] font-medium">{transactionType}</span>
              </div>

              <div className="flex justify-between items-baseline border-b border-[#EDE9E1] pb-2">
                <span className="text-[#78726A]">Amount</span>
                <span className="text-[#2C2A29] font-medium">${amount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-baseline border-b border-[#EDE9E1] pb-2">
                <span className="text-[#78726A]">Sender Delta</span>
                <span className="text-[#2C2A29] font-medium">
                  ${(senderOldBalance - senderNewBalance).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-baseline border-b border-[#EDE9E1] pb-2">
                <span className="text-[#78726A]">Discrepancy</span>
                <span className={`font-medium ${discrepancy !== 0 ? 'text-[#B84A39]' : 'text-[#3B7A57]'}`}>
                  ${discrepancy.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-baseline border-b border-[#EDE9E1] pb-2">
                <span className="text-[#78726A]">Time Vector</span>
                <span className="text-[#2C2A29] font-medium">
                  {hour.toString().padStart(2, '0')}:00 HRS
                </span>
              </div>
            </div>
          </div>

          {/* Editorial Model Knowledge Note */}
          <div className="space-y-3 pt-4 border-t border-[#E6E1D8]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
              Model Insight
            </h3>

            <p className="text-xs text-[#78726A] leading-relaxed">
              Financial anomalies in PaySim predominantly occur during high-value <strong className="text-[#2C2A29] font-medium">TRANSFER</strong> and <strong className="text-[#2C2A29] font-medium">CASH_OUT</strong> transactions, specifically when accounts are drained completely to zero with zero-destination record balances.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
