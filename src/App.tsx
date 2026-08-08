import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header, { PageTab } from './components/Header';
import InputPage from './components/InputPage';
import ResultsPage from './components/ResultsPage';
import EvaluationMetrics from './components/EvaluationMetrics';

export type ChipType = 'Swipe Transaction' | 'Chip Transaction' | 'Online Transaction';
export type ErrorType = 'No error' | 'Bad CVV' | 'Bad PIN' | 'Insufficient Balance' | 'Bad Expiration';

type AuditStatus = 'idle' | 'loading' | 'safe' | 'fraud';

export interface ApiResult {
  probability: number;
  is_fraud: boolean;
  threshold: number;
  customer_known: boolean;
  merchant_known: boolean;
}

export default function App() {
  // Page Navigation state
  const [activeTab, setActiveTab] = useState<PageTab>('input');

  // API configuration
  const [apiUrl, setApiUrl] = useState('');

  // Transaction parameters — matches main.py payload
  const [user, setUser] = useState(876);
  const [card, setCard] = useState(1);
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15);
  const [time, setTime] = useState('03:40');
  const [amount, setAmount] = useState('$2100.00');
  const [merchantName, setMerchantName] = useState('2814378089490887845');
  const [mcc, setMcc] = useState(5999);
  const [useChip, setUseChip] = useState<ChipType>('Online Transaction');
  const [errors, setErrors] = useState<ErrorType>('Bad CVV');

  // Audit state
  const [status, setStatus] = useState<AuditStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAuditResult, setHasAuditResult] = useState(false);
  const [apiResult, setApiResult] = useState<ApiResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const performAudit = useCallback(async () => {
    if (!apiUrl.trim()) {
      setApiError('Please enter an API URL first.');
      return;
    }

    setIsLoading(true);
    setStatus('loading');
    setApiError(null);

    // Artificial delay to prevent a flashing blank screen
    await new Promise(resolve => setTimeout(resolve, 2000));

    const payload = {
      User: Number(user),
      Card: Number(card),
      Year: Number(year),
      Month: Number(month),
      Day: Number(day),
      Time: time,
      Amount: amount,
      'Merchant Name': Number(merchantName),
      MCC: Number(mcc),
      'Use Chip': useChip,
      'Errors?': errors,
    };

    try {
      const baseUrl = apiUrl.replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Prediction backend response:', data);

      const CLASSIFIER_THRESHOLD = 0.25;
      const thresholdVal = CLASSIFIER_THRESHOLD;
      const isFraudResult = data.probability !== undefined ? data.probability >= CLASSIFIER_THRESHOLD : Boolean(data.is_fraud);

      const result: ApiResult = {
        probability: data.probability,
        is_fraud: isFraudResult,
        threshold: thresholdVal,
        customer_known: data.customer_known,
        merchant_known: data.merchant_known,
      };

      setApiResult(result);
      setStatus(isFraudResult ? 'fraud' : 'safe');
    } catch (error) {
      console.error('Failed to get prediction from backend:', error);
      setApiError(error instanceof Error ? error.message : 'Unknown error');

      // Fallback heuristic for demo purposes
      const amountNum = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
      const isHighRisk =
        amountNum > 500 ||
        useChip === 'Online Transaction' ||
        errors !== 'No error';

      const CLASSIFIER_THRESHOLD = 0.25;
      const fallback: ApiResult = {
        probability: isHighRisk ? 0.87 : 0.12,
        is_fraud: isHighRisk,
        threshold: CLASSIFIER_THRESHOLD,
        customer_known: user < 10000,
        merchant_known: true,
      };

      setApiResult(fallback);
      setStatus(isHighRisk ? 'fraud' : 'safe');
    } finally {
      setIsLoading(false);
      setHasAuditResult(true);
      setActiveTab('results');
    }
  }, [apiUrl, user, card, year, month, day, time, amount, merchantName, mcc, useChip, errors]);

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
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
              user={user}
              setUser={setUser}
              card={card}
              setCard={setCard}
              year={year}
              setYear={setYear}
              month={month}
              setMonth={setMonth}
              day={day}
              setDay={setDay}
              time={time}
              setTime={setTime}
              amount={amount}
              setAmount={setAmount}
              merchantName={merchantName}
              setMerchantName={setMerchantName}
              mcc={mcc}
              setMcc={setMcc}
              useChip={useChip}
              setUseChip={setUseChip}
              errors={errors}
              setErrors={setErrors}
              onAudit={performAudit}
              isLoading={isLoading}
              apiError={apiError}
            />
          )}

          {activeTab === 'results' && (
            <ResultsPage
              key="results-page"
              status={status}
              apiResult={apiResult}
              amount={amount}
              useChip={useChip}
              errors={errors}
              time={time}
              apiError={apiError}
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
