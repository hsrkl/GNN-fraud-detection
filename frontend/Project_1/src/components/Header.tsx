import { motion } from 'framer-motion';

const Header = () => {
  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
      className="fixed top-0 left-0 w-full z-50 h-16 flex items-center justify-between px-6
                 bg-[#0D1320]/80 backdrop-blur-xl
                 border-b border-[#00F2FE]/20"
      style={{
        boxShadow: '0 1px 12px rgba(0, 242, 254, 0.08)',
      }}
    >
      {/* Left side — Brand */}
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label="shield">
          🛡️
        </span>

        <div className="flex items-baseline gap-2">
          <h1 className="font-mono font-bold text-lg tracking-widest text-[#00F2FE] select-none">
            SAFEGUARD AI
          </h1>
          <span className="hidden sm:inline font-mono text-xs tracking-wider text-gray-500">
            // Command Center
          </span>
        </div>
      </div>

      {/* Right side — Model status */}
      <div className="flex items-center gap-2.5">
        {/* Pulsing live dot */}
        <span className="relative flex h-2.5 w-2.5">
          {/* Glow ring */}
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-emerald-400"
          />
          {/* Solid core */}
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>

        <p className="font-mono text-xs text-gray-500 tracking-wide select-none">
          MODEL: XGBoost V1.2 —{' '}
          <span className="text-emerald-400 font-semibold">LIVE</span>
        </p>
      </div>
    </motion.header>
  );
};

export default Header;
