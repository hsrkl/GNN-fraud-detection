import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ChipType, ErrorType } from '../App';

interface InputHubProps {
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

const CHIP_OPTIONS: ChipType[] = ['Swipe Transaction', 'Chip Transaction', 'Online Transaction'];
const CHIP_SHORT: Record<ChipType, string> = {
  'Swipe Transaction': 'Swipe',
  'Chip Transaction': 'Chip',
  'Online Transaction': 'Online',
};
const ERROR_OPTIONS: ErrorType[] = ['No error', 'Bad CVV', 'Bad PIN', 'Insufficient Balance', 'Bad Expiration'];

const MCC_PRESETS = [
  { label: '5411 – Grocery', value: 5411 },
  { label: '5999 – Misc Retail', value: 5999 },
  { label: '5732 – Electronics', value: 5732 },
  { label: '5812 – Restaurants', value: 5812 },
  { label: '4111 – Transport', value: 4111 },
];

const AMOUNT_PRESETS = [
  { label: '$10', value: '$10.00' },
  { label: '$50', value: '$50.00' },
  { label: '$500', value: '$500.00' },
  { label: '$2K', value: '$2000.00' },
];

export default function InputHub({
  apiUrl,
  setApiUrl,
  user,
  setUser,
  card,
  setCard,
  year,
  setYear,
  month,
  setMonth,
  day,
  setDay,
  time,
  setTime,
  amount,
  setAmount,
  merchantName,
  setMerchantName,
  mcc,
  setMcc,
  useChip,
  setUseChip,
  errors,
  setErrors,
  onAudit,
  isLoading,
  apiError,
}: InputHubProps) {
  const [urlFocused, setUrlFocused] = useState(false);

  return (
    <div className="space-y-10">
      {/* ── 00. API Endpoint ──────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
          00. API Endpoint
        </h3>
        <p className="text-xs text-[#A0988E] leading-relaxed">
          Enter the base ngrok URL (or any URL) where the GNN + XGBoost fraud detection model is hosted.
        </p>

        <div className={`flex items-baseline border-b pb-2 transition-colors ${
          urlFocused ? 'border-[#C85A32]' : 'border-[#E6E1D8]'
        }`}>
          <span className="font-mono text-sm text-[#78726A] mr-2 flex-shrink-0">URL</span>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            onFocus={() => setUrlFocused(true)}
            onBlur={() => setUrlFocused(false)}
            placeholder="https://your-ngrok-url.ngrok-free.app"
            className="w-full bg-transparent font-mono text-sm text-[#2C2A29] outline-none border-none p-0 focus:ring-0"
            style={{ borderBottom: 'none' }}
          />
        </div>

        {apiError && (
          <div className="text-xs font-mono text-[#B84A39] mt-1">
            ⚠ {apiError}
          </div>
        )}
      </div>

      {/* ── 01. Transaction Method ────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
          01. Transaction Method
        </h3>

        <div className="flex items-center gap-1 border-b border-[#E6E1D8] pb-3">
          {CHIP_OPTIONS.map((opt) => {
            const active = useChip === opt;
            return (
              <button
                key={opt}
                onClick={() => setUseChip(opt)}
                className={`
                  relative px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer border-none bg-transparent
                  ${active ? 'text-[#C85A32]' : 'text-[#78726A] hover:text-[#2C2A29]'}
                `}
              >
                <span>{CHIP_SHORT[opt]}</span>
                {active && (
                  <motion.div
                    layoutId="chip-type-line"
                    className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-[#C85A32]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 02. Transaction Amount ────────────────────────── */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
            02. Transaction Amount
          </h3>
          <div className="flex items-center gap-3">
            {AMOUNT_PRESETS.map((p) => (
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

        <div className="flex items-baseline border-b border-[#E6E1D8] pb-2">
          <span className="font-serif text-3xl text-[#78726A] mr-2">$</span>
          <input
            type="text"
            value={amount.replace(/^\$/, '')}
            onChange={(e) => setAmount(`$${e.target.value}`)}
            placeholder="0.00"
            className="w-full bg-transparent font-serif text-3xl font-semibold text-[#2C2A29] outline-none border-none p-0 focus:ring-0"
            style={{ borderBottom: 'none' }}
          />
        </div>
      </div>

      {/* ── 03. Customer Identity ─────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
          03. Customer Identity
        </h3>

        <div className="grid grid-cols-2 gap-6">
          {/* User ID */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-[#78726A] font-medium tracking-wide uppercase text-[10px]">User ID</span>
              <span className="font-mono text-[#2C2A29]">{user}</span>
            </div>
            <input
              type="range"
              min={0}
              max={2000}
              step={1}
              value={Math.min(2000, user)}
              onChange={(e) => setUser(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              min={0}
              value={user}
              onChange={(e) => setUser(Number(e.target.value) || 0)}
              className="w-full"
              style={{ borderBottom: 'none' }}
            />
          </div>

          {/* Card Index */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-[#78726A] font-medium tracking-wide uppercase text-[10px]">Card Index</span>
              <span className="font-mono text-[#2C2A29]">{card}</span>
            </div>
            <input
              type="range"
              min={0}
              max={9}
              step={1}
              value={card}
              onChange={(e) => setCard(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              min={0}
              max={9}
              value={card}
              onChange={(e) => setCard(Number(e.target.value) || 0)}
              className="w-full"
              style={{ borderBottom: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* ── 04. Date & Time Vector ────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
          04. Date & Time Vector
        </h3>

        <div className="grid grid-cols-3 gap-6">
          {/* Year */}
          <div className="space-y-1">
            <span className="text-[10px] text-[#78726A] font-medium tracking-wide uppercase">Year</span>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value) || 2024)}
              className="w-full"
              style={{ borderBottom: 'none' }}
            />
          </div>

          {/* Month */}
          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] text-[#78726A] font-medium tracking-wide uppercase">Month</span>
              <span className="font-mono text-xs text-[#2C2A29]">{month}</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value) || 1)}
              className="w-full"
              style={{ borderBottom: 'none' }}
            />
          </div>

          {/* Day */}
          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] text-[#78726A] font-medium tracking-wide uppercase">Day</span>
              <span className="font-mono text-xs text-[#2C2A29]">{day}</span>
            </div>
            <input
              type="range"
              min={1}
              max={31}
              step={1}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              min={1}
              max={31}
              value={day}
              onChange={(e) => setDay(Number(e.target.value) || 1)}
              className="w-full"
              style={{ borderBottom: 'none' }}
            />
          </div>
        </div>

        {/* Time */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-[#78726A] font-medium tracking-wide uppercase text-[10px]">
              Time (HH:MM)
            </span>
          </div>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-transparent font-mono text-base text-[#2C2A29] outline-none border-b border-[#E6E1D8] focus:border-[#C85A32] p-1 transition-colors"
            style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0 }}
          />
        </div>
      </div>

      {/* ── 05. Merchant Details ──────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
          05. Merchant Details
        </h3>

        {/* Merchant Name (ID) */}
        <div className="space-y-1">
          <span className="text-[10px] text-[#78726A] font-medium tracking-wide uppercase">
            Merchant Name (ID)
          </span>
          <input
            type="text"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            placeholder="Large integer merchant identifier"
            className="w-full"
            style={{ borderBottom: 'none' }}
          />
        </div>

        {/* MCC Code */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-[#78726A] font-medium tracking-wide uppercase text-[10px]">
              MCC Code
            </span>
            <span className="font-mono text-[#2C2A29]">{mcc}</span>
          </div>
          <input
            type="number"
            value={mcc}
            onChange={(e) => setMcc(Number(e.target.value) || 0)}
            className="w-full"
            style={{ borderBottom: 'none' }}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {MCC_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setMcc(p.value)}
                className={`
                  text-[10px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer border
                  ${mcc === p.value
                    ? 'border-[#C85A32] text-[#C85A32] bg-[#FAF0EC]'
                    : 'border-[#E6E1D8] text-[#78726A] hover:border-[#C85A32] bg-transparent'}
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 06. Error Signals ─────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#78726A]">
          06. Error Signals
        </h3>

        <div className="flex flex-wrap gap-2">
          {ERROR_OPTIONS.map((opt) => {
            const active = errors === opt;
            const isError = opt !== 'No error';
            return (
              <button
                key={opt}
                onClick={() => setErrors(opt)}
                className={`
                  text-xs font-mono px-3 py-1.5 rounded transition-all cursor-pointer border
                  ${active
                    ? isError
                      ? 'border-[#B84A39] text-[#B84A39] bg-[#FBF0EF] font-semibold'
                      : 'border-[#3B7A57] text-[#3B7A57] bg-[#EBF3EE] font-semibold'
                    : 'border-[#E6E1D8] text-[#78726A] hover:border-[#A0988E] bg-transparent'}
                `}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Submit Button ─────────────────────────────────── */}
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
            'Run Fraud Detection Inference'
          )}
        </button>
      </div>
    </div>
  );
}
