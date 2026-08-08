interface EvidenceLedgerProps {
  status: 'idle' | 'loading' | 'safe' | 'fraud';
  amount: number;
  balanceDiscrepancy: number;
  senderOldBalance: number;
  senderNewBalance: number;
}

export default function EvidenceLedger({
  status,
  amount,
  balanceDiscrepancy,
  senderOldBalance,
  senderNewBalance,
}: EvidenceLedgerProps) {
  const isFraud = status === 'fraud';

  const metrics = [
    { label: 'Transaction Amount', value: `$${amount.toLocaleString()}`, note: 'Primary scale factor' },
    { label: 'Sender Balance Delta', value: `$${(senderOldBalance - senderNewBalance).toLocaleString()}`, note: 'Account exhaustion delta' },
    { label: 'Discrepancy Vector', value: `$${balanceDiscrepancy.toLocaleString()}`, note: balanceDiscrepancy !== 0 ? 'Anomaly flag' : 'Nominal' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
          Feature Evidence Analysis
        </h3>
        <h2 className="font-serif text-2xl text-[#2C2A29]">
          Key Predictors
        </h2>
      </div>

      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="border-b border-[#E6E1D8] pb-3 space-y-1">
            <div className="flex justify-between items-baseline text-xs font-mono">
              <span className="text-[#78726A]">{m.label}</span>
              <span className="text-[#2C2A29] font-medium">{m.value}</span>
            </div>
            <div className="text-[11px] text-[#A0988E] italic">
              {m.note}
            </div>
          </div>
        ))}
      </div>

      {/* SHAP Summary Note */}
      <div className="pt-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#78726A] mb-2">
          Model Feature Importance
        </h4>
        <p className="text-xs text-[#78726A] leading-relaxed">
          The XGBoost decision trees prioritize <span className="font-mono text-[#2C2A29]">errorBalanceOrig</span> (calculated balance discrepancy) and <span className="font-mono text-[#2C2A29]">amount</span> as the primary split indicators for binary fraud detection.
        </p>
      </div>
    </div>
  );
}
