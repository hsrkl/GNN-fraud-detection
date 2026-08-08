import { motion } from 'framer-motion';

export type PageTab = 'input' | 'results' | 'metrics';

interface HeaderProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  hasResult: boolean;
}

const TABS: { id: PageTab; label: string }[] = [
  { id: 'input', label: '01  Parameters' },
  { id: 'results', label: '02  Audit Results' },
  { id: 'metrics', label: '03  Evaluation Metrics' },
];

export default function Header({ activeTab, onSelectTab, hasResult }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 h-16 bg-[#F7F4EE]/90 backdrop-blur-md border-b border-[#E6E1D8] transition-all">
      <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Brand Wordmark */}
        <button
          onClick={() => onSelectTab('input')}
          className="flex items-center gap-2.5 text-left group cursor-pointer border-none bg-transparent p-0"
        >
          <span className="text-lg">🛡️</span>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-semibold tracking-tight text-[#2C2A29]">
              Safeguard <span className="italic text-[#C85A32] font-normal">AI</span>
            </span>
          </div>
        </button>

        {/* Text Navigation */}
        <nav className="flex items-center gap-8">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`
                  relative py-1 text-xs tracking-wider transition-colors cursor-pointer border-none bg-transparent
                  ${isActive ? 'text-[#2C2A29] font-semibold' : 'text-[#78726A] hover:text-[#2C2A29] font-normal'}
                `}
              >
                <span>{tab.label}</span>

                {tab.id === 'results' && hasResult && (
                  <span className="absolute -top-0.5 -right-2.5 w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
                )}

                {isActive && (
                  <motion.div
                    layoutId="header-active-line"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C85A32]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quiet Status */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#78726A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B7A57]" />
          <span className="font-mono text-[11px]">XGBoost v1.2</span>
        </div>
      </div>
    </header>
  );
}
