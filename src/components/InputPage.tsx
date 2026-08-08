import { motion } from 'framer-motion';
import InputHub from './InputHub';
import type { ChipType, ErrorType } from '../App';

interface InputPageProps {
  apiUrl: string;
  setApiUrl: (s: string) => void;
  user: number;
  setUser: (n: number) => void;
  card: number;
  setCard: (n: number) => void;
  year: number;
  setYear: (n: number) => void;
  month: number;
  setMonth: (n: number) => void;
  day: number;
  setDay: (n: number) => void;
  time: string;
  setTime: (s: string) => void;
  amount: string;
  setAmount: (s: string) => void;
  merchantName: string;
  setMerchantName: (s: string) => void;
  mcc: number;
  setMcc: (n: number) => void;
  useChip: ChipType;
  setUseChip: (c: ChipType) => void;
  errors: ErrorType;
  setErrors: (e: ErrorType) => void;
  onAudit: () => void;
  isLoading: boolean;
  apiError: string | null;
}

interface Preset {
  name: string;
  desc: string;
  dotColor: string;
  dotLabel: string;
  user: number;
  card: number;
  year: number;
  month: number;
  day: number;
  time: string;
  amount: string;
  merchantName: string;
  mcc: number;
  useChip: ChipType;
  errors: ErrorType;
}

const PRESETS: Preset[] = [
  {
    name: 'Normal Daytime Swipe',
    desc: 'Standard in-store purchase during business hours',
    dotColor: '#3B7A57',
    dotLabel: 'LOW RISK',
    user: 1, card: 0, year: 2024, month: 6, day: 15,
    time: '13:42', amount: '$47.20',
    merchantName: '3527213246127876916',
    mcc: 5411, useChip: 'Swipe Transaction', errors: 'No error',
  },
  {
    name: 'Odd Hour Online + Bad CVV',
    desc: 'Late-night large online purchase with CVV error',
    dotColor: '#B84A39',
    dotLabel: 'HIGH RISK',
    user: 1, card: 0, year: 2024, month: 6, day: 15,
    time: '03:17', amount: '$1894.99',
    merchantName: '9184223317239487261',
    mcc: 5999, useChip: 'Online Transaction', errors: 'Bad CVV',
  },
  {
    name: 'Cold Start (Unseen User)',
    desc: 'New user and merchant with no graph history',
    dotColor: '#A86B24',
    dotLabel: 'UNKNOWN',
    user: 999999, card: 9, year: 2024, month: 6, day: 15,
    time: '11:05', amount: '$312.00',
    merchantName: '1111111111111111111',
    mcc: 5732, useChip: 'Chip Transaction', errors: 'No error',
  },
  {
    name: 'Error Test (Missing Field)',
    desc: 'Deliberately incomplete — expects 400 error from API',
    dotColor: '#78726A',
    dotLabel: 'ERROR',
    user: 1, card: 0, year: 2024, month: 6, day: 15,
    time: '', amount: '$50.00',
    merchantName: '3527213246127876916',
    mcc: 5411, useChip: 'Swipe Transaction', errors: 'No error',
  },
];

export default function InputPage({
  apiUrl, setApiUrl,
  user, setUser,
  card, setCard,
  year, setYear,
  month, setMonth,
  day, setDay,
  time, setTime,
  amount, setAmount,
  merchantName, setMerchantName,
  mcc, setMcc,
  useChip, setUseChip,
  errors, setErrors,
  onAudit,
  isLoading,
  apiError,
}: InputPageProps) {

  const applyPreset = (p: Preset) => {
    setUser(p.user);
    setCard(p.card);
    setYear(p.year);
    setMonth(p.month);
    setDay(p.day);
    setTime(p.time);
    setAmount(p.amount);
    setMerchantName(p.merchantName);
    setMcc(p.mcc);
    setUseChip(p.useChip);
    setErrors(p.errors);
  };

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
          Card Transaction Audit
        </h1>

        <p className="text-sm text-[#78726A] max-w-2xl leading-relaxed">
          Configure card transaction parameters to evaluate against the live GNN + XGBoost fraud detection model.
          The model uses graph neural network embeddings for user–merchant relationships combined with gradient-boosted tree classification.
        </p>

        {/* Preset Scenarios */}
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
                ({p.amount})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Flow Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7">
          <InputHub
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
            onAudit={onAudit}
            isLoading={isLoading}
            apiError={apiError}
          />
        </div>

        {/* Right Column: Payload Preview & Model Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-10 lg:border-l lg:border-[#E6E1D8] lg:pl-10">
          {/* Payload Preview */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
              Payload Preview
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {([
                ['User', String(user)],
                ['Card', String(card)],
                ['Date', `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`],
                ['Time', time || '—'],
                ['Amount', amount],
                ['Merchant', merchantName.length > 12 ? `…${merchantName.slice(-10)}` : merchantName],
                ['MCC', String(mcc)],
                ['Method', useChip],
                ['Error Signal', errors],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between items-baseline border-b border-[#EDE9E1] pb-2">
                  <span className="text-[#78726A]">{label}</span>
                  <span className="text-[#2C2A29] font-medium text-right max-w-[180px] truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Model Insight Note */}
          <div className="space-y-3 pt-4 border-t border-[#E6E1D8]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
              Model Architecture
            </h3>

            <p className="text-xs text-[#78726A] leading-relaxed">
              The fraud detection pipeline uses a <strong className="text-[#2C2A29] font-medium">Graph Neural Network</strong> to learn user–merchant interaction embeddings, combined with an <strong className="text-[#2C2A29] font-medium">XGBoost</strong> classifier for the final fraud probability prediction.
            </p>

            <p className="text-xs text-[#78726A] leading-relaxed">
              Key signals include temporal anomalies (late-night transactions), transaction method (online vs. chip), error codes (failed CVV/PIN), and graph-based cold-start detection for unseen users and merchants.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
