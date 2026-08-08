interface FraudRadarProps {
  status: 'idle' | 'loading' | 'safe' | 'fraud';
  probability: number;
  threshold: number;
  amount: string;
  customerKnown: boolean;
  merchantKnown: boolean;
}

export default function FraudRadar({
  status,
  probability: _probability,
  threshold,
  amount,
  customerKnown,
  merchantKnown,
}: FraudRadarProps) {
  const isFraud = status === 'fraud';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
          Model Inference Result
        </h3>
        <h2 className="font-serif text-2xl text-[#2C2A29]">
          {isFraud ? 'Flagged as High Risk Fraud' : 'Cleared as Safe Transaction'}
        </h2>
      </div>

      {/* Decision Summary Card */}
      <div className="border border-[#E6E1D8] p-6 space-y-5 bg-[#FAF7F2]">
        <div className="flex items-center justify-between border-b border-[#EDE9E1] pb-4">
          <span className="text-xs text-[#78726A] font-mono">MODEL VERDICT</span>
          <span className={`text-xs font-mono font-semibold ${isFraud ? 'text-[#B84A39]' : 'text-[#3B7A57]'}`}>
            {isFraud ? '● FRAUD DETECTED' : '● TRANSACTION SAFE'}
          </span>
        </div>

        {/* Key Info */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-mono text-[#78726A]">
            <span>TRANSACTION AMOUNT</span>
            <span className="text-[#2C2A29] font-medium">{amount}</span>
          </div>
          <div className="flex justify-between text-xs font-mono text-[#78726A]">
            <span>CLASSIFIER THRESHOLD</span>
            <span className="text-[#2C2A29]">{(threshold * 100).toFixed(0)}% ({threshold.toFixed(2)})</span>
          </div>
          <div className="flex justify-between text-xs font-mono text-[#78726A]">
            <span>AUDIT ALGORITHM</span>
            <span className="text-[#2C2A29]">GNN + XGBoost</span>
          </div>
        </div>

        {/* Graph Connectivity Status */}
        <div className="space-y-2 pt-2 border-t border-[#EDE9E1]">
          <div className="flex justify-between text-xs font-mono text-[#78726A]">
            <span>CUSTOMER IN GRAPH</span>
            <span className={`font-semibold ${customerKnown ? 'text-[#3B7A57]' : 'text-[#A86B24]'}`}>
              {customerKnown ? '● Known' : '○ Cold Start'}
            </span>
          </div>
          <div className="flex justify-between text-xs font-mono text-[#78726A]">
            <span>MERCHANT IN GRAPH</span>
            <span className={`font-semibold ${merchantKnown ? 'text-[#3B7A57]' : 'text-[#A86B24]'}`}>
              {merchantKnown ? '● Known' : '○ Cold Start'}
            </span>
          </div>
        </div>

        {/* Narrative Verdict */}
        <div className="pt-2 border-t border-[#EDE9E1] text-xs text-[#78726A] leading-relaxed">
          {isFraud ? (
            <p>
              This transaction exhibits behavioral signatures highly correlated with card fraud patterns.
              Key graph-based and feature signals exceeded the decision boundary.
              {!customerKnown && ' The customer is not in the training graph — cold-start risk applies.'}
              {!merchantKnown && ' The merchant is unseen — limited graph context available.'}
            </p>
          ) : (
            <p>
              No high-risk signals detected. The transaction profile matches known legitimate patterns
              in the user–merchant interaction graph.
              {customerKnown && merchantKnown && ' Both customer and merchant have established graph histories.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
