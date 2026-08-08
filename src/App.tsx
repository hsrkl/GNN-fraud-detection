import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header, { PageTab } from './components/Header';
import InputPage from './components/InputPage';
import ResultsPage from './components/ResultsPage';
import EvaluationMetrics from './components/EvaluationMetrics';

type AuditStatus = 'idle' | 'loading' | 'safe' | 'fraud';

export default function App() {
  // Page Navigation state
  const [activeTab, setActiveTab] = useState<PageTab>('input');

  // Transaction parameters
  const [transactionType, setTransactionType] = useState<'TRANSFER' | 'CASH_OUT'>('TRANSFER');
  const [amount, setAmount] = useState(25000);
  const [senderOldBalance, setSenderOldBalance] = useState(100000);
  const [senderNewBalance, setSenderNewBalance] = useState(75000);
  const [receiverOldBalance, setReceiverOldBalance] = useState(50000);
  const [receiverNewBalance, setReceiverNewBalance] = useState(75000);
  const [hour, setHour] = useState(14);

  // Audit state
  const [status, setStatus] = useState<AuditStatus>('idle');
  const [riskScore, setRiskScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAuditResult, setHasAuditResult] = useState(false);

  // Auto-calculate sender new balance when amount or sender old balance changes
  useEffect(() => {
    const calculated = Math.max(0, senderOldBalance - amount);
    setSenderNewBalance(calculated);
  }, [amount, senderOldBalance]);

  // Auto-calculate receiver new balance
  useEffect(() => {
    if (transactionType === 'CASH_OUT') {
      setReceiverOldBalance(0);
      setReceiverNewBalance(0);
    } else {
      setReceiverNewBalance(receiverOldBalance + amount);
    }
  }, [amount, receiverOldBalance, transactionType]);

  // Balance discrepancy calculation (errorBalanceOrig feature)
  const balanceDiscrepancy = senderOldBalance - senderNewBalance - amount;

  const performAudit = useCallback(async () => {
    setIsLoading(true);
    setStatus('loading');

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const currentYear = now.getFullYear();

    const payload = {
      amount: Number(amount),
      hour: Number(hour),
      month: currentMonth,
      day: currentDay,
      year: currentYear,
      chipType: 'Online',
    };

    try {
      const response = await fetch('https://dime-heap-down.ngrok-free.dev/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Prediction backend response:', data);

      const isFraud = Boolean(
        data.is_fraud === true ||
        data.is_fraud === 1 ||
        data.fraud === true ||
        data.fraud === 1 ||
        (data.risk_score !== undefined && data.risk_score > 0.5)
      );

      let score = 0;
      if (typeof data.risk_score === 'number') {
        score = data.risk_score <= 1 ? Math.round(data.risk_score * 100) : Math.round(data.risk_score);
      } else {
        score = isFraud ? 94 : 12;
      }

      setRiskScore(score);
      setStatus(isFraud ? 'fraud' : 'safe');
    } catch (error) {
      console.error('Failed to get prediction from backend:', error);

      // Fallback calculation in case of network issue
      const isHighRisk =
        amount > 200000 ||
        (transactionType === 'CASH_OUT' && senderOldBalance === amount) ||
        Math.abs(balanceDiscrepancy) > 10000;
      const mockScore = isHighRisk ? 96 : Math.min(85, Math.max(12, Math.round((amount / 10000) * 5)));

      setRiskScore(mockScore);
      setStatus(mockScore > 50 ? 'fraud' : 'safe');
    } finally {
      setIsLoading(false);
      setHasAuditResult(true);
      setActiveTab('results');
    }
  }, [amount, hour, transactionType, senderOldBalance, balanceDiscrepancy]);

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2C2A29]">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasResult={hasAuditResult}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(247, 244, 238, 0.95)',
          backdropFilter: 'blur(6px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '16px',
        }}>
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-[#C85A32]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="font-mono text-xs text-[#2C2A29] tracking-wider uppercase">
              Evaluating Model Inference...
            </span>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <main className="pt-20 px-4 sm:px-6 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'input' && (
            <InputPage
              key="input-page"
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
              onAudit={performAudit}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'results' && (
            <ResultsPage
              key="results-page"
              status={status}
              riskScore={riskScore}
              amount={amount}
              transactionType={transactionType}
              senderOldBalance={senderOldBalance}
              senderNewBalance={senderNewBalance}
              receiverOldBalance={receiverOldBalance}
              receiverNewBalance={receiverNewBalance}
              hour={hour}
              balanceDiscrepancy={balanceDiscrepancy}
              onReAudit={() => setActiveTab('input')}
            />
          )}

          {activeTab === 'metrics' && (
            <EvaluationMetrics key="metrics-page" />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
