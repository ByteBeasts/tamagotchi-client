import { motion } from "framer-motion";
import gemIcon from "../../../../assets/icons/gems/icon-gem-single.webp";
import { GemPack } from "../../../../constants/gemShop.constants";

interface GemPackCardProps {
  pack: GemPack;
  onPurchase: () => void;
}

export function GemPackCard({ pack, onPurchase }: GemPackCardProps) {
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="bg-cream p-4 rounded-xl shadow-md flex flex-col items-center relative"
      variants={item}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Popular/Best Value Badge */}
      {(pack.popular || pack.bestValue) && (
        <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-luckiest text-white shadow-lg ${
          pack.bestValue ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-gold to-yellow-500'
        }`}>
          {pack.bestValue ? 'BEST VALUE' : 'POPULAR'}
        </div>
      )}

      {/* Discount Badge */}
      {pack.discount && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-luckiest shadow-md">
          {pack.discount}
        </div>
      )}

      {/* Gem pack image */}
      <div className="h-32 flex items-center justify-center mb-2 overflow-visible">
        <div className="transform scale-150">
          <img
            src={pack.image}
            alt={pack.name}
            className="w-16 h-16 object-contain"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.src = "/placeholder.svg?height=128&width=128";
            }}
          />
        </div>
      </div>

      {/* Name */}
      <h3 className="font-luckiest text-lg text-gray-800 mb-1 text-center">
        {pack.name}
      </h3>

      {/* Gem amount */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50 border-2 border-purple-400 px-3 py-1 rounded-full mb-2">
        <img src={gemIcon} alt="Gems" className="w-5 h-5" />
        <span className="font-luckiest text-purple-700">{pack.gemAmount} Gems</span>
      </div>

      {/* Description */}
      <p className="font-luckiest text-sm text-gray-600 mb-3 text-center h-8 overflow-hidden leading-tight">
        {pack.description}
      </p>

      {/* Purchase button */}
      <motion.button
        onClick={onPurchase}
        className="btn-cr-store w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <span>Buy</span>
        <span className="font-bold">{pack.priceDisplay}</span>
        <span className="text-xs">USDC</span>
      </motion.button>
    </motion.div>
  );
}