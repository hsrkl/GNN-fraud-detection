import { motion } from 'framer-motion';

interface FraudRadarProps {
  status: 'idle' | 'loading' | 'safe' | 'fraud';
  riskScore: number;
  amount: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);

export default function FraudRadar({
  status,
  amount,
}: FraudRadarProps) {
  const isFraud = status === 'fraud';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
          Binary Decision Outcome
        </h3>
        <h2 className="font-serif text-2xl text-[#2C2A29]">
          {isFraud ? 'Flagged as High Risk Fraud' : 'Cleared as Safe Transaction'}
        </h2>
      </div>

      {/* Decision Summary Card (Light Warm Style) */}
      <div className="border border-[#E6E1D8] p-6 space-y-5 bg-[#FAF7F2]">
        <div className="flex items-center justify-between border-b border-[#EDE9E1] pb-4">
          <span className="text-xs text-[#78726A] font-mono">MODEL VERDICT</span>
          <span className={`text-xs font-mono font-semibold ${isFraud ? 'text-[#B84A39]' : 'text-[#3B7A57]'}`}>
            {isFraud ? '● CLASS 1 (FRAUD)' : '● CLASS 0 (SAFE)'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-[#78726A]">
            <span>TRANSACTION AMOUNT</span>
            <span className="text-[#2C2A29] font-medium">{fmt(amount)}</span>
          </div>
          <div className="flex justify-between text-xs font-mono text-[#78726A]">
            <span>CLASSIFIER THRESHOLD</span>
            <span className="text-[#2C2A29]">0.50</span>
          </div>
          <div className="flex justify-between text-xs font-mono text-[#78726A]">
            <span>AUDIT ALGORITHM</span>
            <span className="text-[#2C2A29]">XGBoost v1.2</span>
          </div>
        </div>

        {/* Narrative Verdict Text */}
        <div className="pt-2 border-t border-[#EDE9E1] text-xs text-[#78726A] leading-relaxed">
          {isFraud ? (
            <p>
              This transaction exhibits behavioral signatures highly correlated with PaySim fraud patterns. Key flags include complete account exhaustion and recipient balance anomalies.
            </p>
          ) : (
            <p>
              No high-risk discrepancies detected. Sender balance and transaction amount follow expected routine peer-to-peer distribution curves.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
