import { useState } from 'react';
import { motion } from 'framer-motion';

interface InputHubProps {
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

const padHour = (h: number) => `${String(h).padStart(2, '0')}:00`;

const PRESETS = [
  { label: '$100', value: 100 },
  { label: '$10K', value: 10_000 },
  { label: '$100K', value: 100_000 },
  { label: 'Max', value: 500_000 },
];

const TIME_TICKS = [0, 6, 12, 18, 23];

function BalanceInputField({
  label,
  value,
  onChange,
  isAuto = false,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange?: (v: number) => void;
  isAuto?: boolean;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isAuto) return;
    const val = e.target.value;
    onChange?.(val === '' ? 0 : Number(val));
  };

  const displayValue = disabled ? 0 : focused && value === 0 ? '' : isNaN(value) ? '' : value;

  return (
    <div className={`space-y-1 ${disabled ? 'opacity-40' : ''}`}>
      <div className="flex justify-between items-center text-xs">
        <span className="text-[#78726A] font-medium tracking-wide uppercase text-[10px]">
          {label}
        </span>
        {isAuto && !disabled && (
          <span className="font-mono text-[9px] text-[#C85A32] tracking-wider">AUTO</span>
        )}
        {disabled && (
          <span className="font-mono text-[9px] text-[#A0988E] tracking-wider">N/A</span>
        )}
      </div>

      <div className={`flex items-baseline border-b pb-1.5 transition-colors ${
        focused && !disabled ? 'border-[#C85A32]' : 'border-[#E6E1D8]'
      }`}>
        <span className="text-sm font-mono text-[#78726A] mr-1.5">$</span>
        <input
          type="number"
          disabled={disabled}
          readOnly={isAuto || disabled}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => !disabled && setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0"
          className="w-full bg-transparent font-mono text-base text-[#2C2A29] outline-none border-none p-0 focus:ring-0 cursor-text"
        />
      </div>
    </div>
  );
}

export default function InputHub({
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
}: InputHubProps) {
  const [amountFocused, setAmountFocused] = useState(false);
  const isCashOut = transactionType === 'CASH_OUT';

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmount(val === '' ? 0 : Number(val));
  };

  const displayAmountValue = amountFocused && amount === 0 ? '' : isNaN(amount) ? '' : amount;

  return (
    <div className="space-y-8">
      {/* Transaction Type Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
          01. Transaction Type
        </h3>
        
        {/* Simple text labels with underline indicator */}
        <div className="flex items-center gap-8 border-b border-[#E6E1D8] pb-3">
          {(['TRANSFER', 'CASH_OUT'] as const).map((t) => {
            const active = transactionType === t;
            return (
              <button
                key={t}
                onClick={() => setTransactionType(t)}
                className={`
                  relative pb-1 text-sm font-medium transition-colors cursor-pointer border-none bg-transparent p-0
                  ${active ? 'text-[#C85A32]' : 'text-[#78726A] hover:text-[#2C2A29]'}
                `}
              >
                <span>{t === 'TRANSFER' ? 'Transfer' : 'Cash Out'}</span>
                {active && (
                  <motion.div
                    layoutId="tx-type-line"
                    className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-[#C85A32]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction Amount Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
            02. Transaction Amount
          </h3>
          <div className="flex items-center gap-3">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setAmount(p.value)}
                className={`
                  text-xs font-mono transition-colors cursor-pointer border-none bg-transparent p-0
                  ${amount === p.value ? 'text-[#C85A32] font-semibold underline' : 'text-[#78726A] hover:text-[#2C2A29]'}
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Minimal Underlined Large Amount Input */}
        <div className={`flex items-baseline border-b pb-2 transition-colors ${
          amountFocused ? 'border-[#C85A32]' : 'border-[#E6E1D8]'
        }`}>
          <span className="font-serif text-3xl text-[#78726A] mr-2">$</span>
          <input
            type="number"
            min={0}
            value={displayAmountValue}
            onChange={handleAmountInputChange}
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
            placeholder="0"
            className="w-full bg-transparent font-serif text-3xl font-semibold text-[#2C2A29] outline-none border-none p-0 focus:ring-0"
          />
        </div>

        {/* Minimal thin slider */}
        <div className="pt-2">
          <input
            type="range"
            min={0}
            max={500_000}
            step={1000}
            value={Math.min(500_000, amount)}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Balance Matrix Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
          03. Balance Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
          <BalanceInputField
            label="Sender Initial Balance"
            value={senderOldBalance}
            onChange={setSenderOldBalance}
          />
          <BalanceInputField
            label="Sender Resulting Balance"
            value={senderNewBalance}
            onChange={setSenderNewBalance}
            isAuto
          />
          <BalanceInputField
            label="Receiver Initial Balance"
            value={isCashOut ? 0 : receiverOldBalance}
            onChange={setReceiverOldBalance}
            disabled={isCashOut}
          />
          <BalanceInputField
            label="Receiver Resulting Balance"
            value={isCashOut ? 0 : receiverNewBalance}
            onChange={setReceiverNewBalance}
            disabled={isCashOut}
            isAuto
          />
        </div>
      </div>

      {/* Transaction Time Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
            04. Time Vector
          </h3>
          <div className="text-sm font-mono text-[#2C2A29]">
            {padHour(hour)}{' '}
            <span className="text-xs text-[#78726A] font-sans">
              ({hour < 6 ? 'Night' : hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'})
            </span>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={23}
          step={1}
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="w-full"
        />

        <div className="flex justify-between text-[10px] font-mono text-[#A0988E]">
          {TIME_TICKS.map((t) => (
            <span key={t}>{String(t).padStart(2, '0')}:00</span>
          ))}
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-4">
        <button
          onClick={onAudit}
          disabled={isLoading}
          className="
            w-full py-3.5 px-6 rounded-md bg-[#C85A32] hover:bg-[#B24E2A] text-white
            font-medium text-sm tracking-wide transition-all cursor-pointer border-none
            disabled:opacity-50 disabled:cursor-not-allowed shadow-sm
          "
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Evaluating Model Inference...
            </span>
          ) : (
            'Run Fraud Audit Inference'
          )}
        </button>
      </div>
    </div>
  );
}
