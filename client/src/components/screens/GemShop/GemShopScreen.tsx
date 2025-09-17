import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { MiniKit } from '@worldcoin/minikit-js';

// Layout components
import { TamagotchiTopBar } from "../../layout/TopBar";

// Shared components
import BackButton from "../../shared/BackButton";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";

// Gem shop components
import { GemPackCard } from "./components/GemPackCard";
import { WorldAppModal } from "./components/WorldAppModal";

// Constants
import { GEM_PACKS, GemPack } from "../../../constants/gemShop.constants";

// Assets
import gemHandfulIcon from "../../../assets/icons/gems/icon-gems-handful.webp";
import gemSingleIcon from "../../../assets/icons/gems/icon-gem-single.webp";

// Screen props
import type { Screen } from "../../types/screens";

// Store
import useAppStore from "../../../zustand/store";

// Services
import { worldcoinPaymentService } from "../../../services/worldcoin/payment.service";

// Cavos hooks
import { useCavosTransaction } from "../../../dojo/hooks/useCavosTransaction";
import { getContractAddresses } from "../../../config/cavosConfig";

interface GemShopScreenProps {
  onNavigation: (screen: Screen) => void;
}

export function GemShopScreen({ onNavigation }: GemShopScreenProps) {
  // Responsive state
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [processingPackId, setProcessingPackId] = useState<number | null>(null);
  const [showWorldAppModal, setShowWorldAppModal] = useState<boolean>(false);

  // Toast position based on screen size
  const position = isMobile ? 'bottom-center' : 'top-right';

  // Store player data and Cavos auth
  const storePlayer = useAppStore(state => state.player);
  const setPlayer = useAppStore(state => state.setPlayer);
  const cavosAuth = useAppStore(state => state.cavos);

  // Cavos transaction hook
  const { executeTransaction } = useCavosTransaction();

  // Check if we're in World App
  const isInWorldApp = MiniKit.isInstalled();
  
  // Responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle gem pack purchase with Worldcoin payments
  const handlePurchase = async (pack: GemPack) => {
    // Check if we're in World App
    if (!isInWorldApp) {
      setShowWorldAppModal(true);
      return;
    }

    try {
      setIsProcessingPayment(true);
      setProcessingPackId(pack.id);

      // Show processing toast
      toast.loading(
        `Processing payment for ${pack.gemAmount} gems...`,
        {
          position,
          id: 'payment-processing'
        }
      );

      // Send payment through World App
      const paymentResult = await worldcoinPaymentService.sendPayment(pack);

      if (paymentResult) {
        // Parse gem amount from reference
        const gemAmount = worldcoinPaymentService.parseGemAmountFromReference(paymentResult.reference);

        if (gemAmount > 0) {
          try {
            // Check if user is authenticated with Cavos
            if (!cavosAuth.isAuthenticated || !cavosAuth.wallet) {
              throw new Error('Please login with ByteBeasts to complete the purchase');
            }

            // Calculate new total gems
            const newTotalGems = (storePlayer?.total_gems || 0) + gemAmount;

            // Get contract addresses
            const contractAddresses = getContractAddresses();

            // Prepare transaction call to update gems
            const calls = [{
              contractAddress: contractAddresses.player,
              entrypoint: 'update_player_total_gems',
              calldata: [newTotalGems.toString()]
            }];

            // Execute transaction via Cavos
            const transactionHash = await executeTransaction(calls);

            // Update local store (optimistic update)
            if (storePlayer) {
              const updatedPlayer = {
                ...storePlayer,
                total_gems: newTotalGems
              };
              setPlayer(updatedPlayer);
            }

            // Show success message
            toast.success(
              <div className="flex items-center gap-2">
                <span>Successfully purchased {gemAmount} gems!</span>
                <img src={gemSingleIcon} alt="gem" className="w-5 h-5 inline-block" />
              </div>,
              {
                position,
                duration: 5000,
                id: 'payment-processing'
              }
            );

            console.log('Payment completed:', {
              packId: pack.id,
              gems: gemAmount,
              worldcoinTxId: paymentResult.transaction_id,
              blockchainTxHash: transactionHash,
              newTotalGems
            });
          } catch (contractError) {
            console.error('Failed to update gems on blockchain:', contractError);
            throw new Error('Failed to update gems balance. Please contact support.');
          }
        } else {
          throw new Error('Invalid payment data');
        }
      } else {
        // User cancelled or payment failed
        toast.dismiss('payment-processing');
        toast.error(
          'Payment was cancelled or failed',
          {
            position,
            duration: 4000
          }
        );
      }
    } catch (error) {
      console.error('Payment error:', error);

      // Show specific error message
      let errorMessage = 'Payment failed. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('login') || error.message.includes('ByteBeasts')) {
          errorMessage = 'Please login with ByteBeasts to complete the purchase';
        } else if (error.message.includes('World App')) {
          errorMessage = 'Please open this app in World App to make payments';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, {
        position,
        duration: 4000,
        id: 'payment-processing'
      });
    } finally {
      setIsProcessingPayment(false);
      setProcessingPackId(null);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="relative h-screen w-full bg-screen overflow-hidden font-rubik">
      <MagicalSparkleParticles />

      {/* Back Button */}
      <BackButton 
        onClick={() => onNavigation("home")} 
        className="top-12 left-4 left-auto"
      />
      
      {/* Top Bar */}
      <TamagotchiTopBar 
        coins={storePlayer?.total_coins || 0}
        gems={storePlayer?.total_gems || 0}
      />

      {/* Animated banner */}
      <motion.div
        className="relative mt-12 mb-3"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Animated Gem Icon */}
        <motion.div
          className="absolute -top-11 right-3 z-10 w-40 h-40"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <img 
            src={gemHandfulIcon}
            alt="Gems"
            className="object-contain"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.src = "/placeholder.svg?height=80&width=80";
            }}
          />
        </motion.div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 py-4 px-4 mx-4 relative rounded-[10px] shadow-md">
          <h2 className="font-luckiest text-white text-xl sm:text-2xl lg:text-3xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] tracking-wide text-left">
            ✨ Gem Shop
          </h2>
          <p className="text-white/90 text-sm mt-1 font-rubik">
            Purchase gems to unlock <br/> magical items
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 h-[calc(100%-16rem)] overflow-y-auto pb-16">
        <div className="px-4 py-2">
          <motion.div 
            className="space-y-8"
            initial="hidden"
            animate="show"
            variants={container}
          >
            {/* Section Header */}
            <motion.div 
              className="flex items-center gap-3 mb-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-md p-2"
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  border: '2px solid rgb(168, 85, 247)'
                }}
              >
                <img src={gemSingleIcon} alt="gem" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-luckiest text-xl text-cream mb-1">
                  Gem Packages
                </h3>
                <p className="text-sm text-text-secondary opacity-80">
                  Choose the perfect pack for your needs
                </p>
              </div>
            </motion.div>

            {/* Gem Packs Grid */}
            <motion.div variants={container}>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {GEM_PACKS.map((pack) => (
                  <GemPackCard
                    key={pack.id}
                    pack={pack}
                    onPurchase={() => handlePurchase(pack)}
                    disabled={isProcessingPayment && processingPackId !== pack.id}
                    loading={isProcessingPayment && processingPackId === pack.id}
                  />
                ))}
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
              className="bg-cream rounded-xl p-4 mt-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="font-luckiest text-gray-800 mb-2">What are gems for?</h4>
              <ul className="space-y-1 text-sm text-gray-700 font-rubik">
                <li>✨ Purchase exclusive magic items that instantly boost your beast</li>
                <li>💊 Revive your beast if it gets sick or tired</li>
                <li>🎁 Unlock special cosmetics and decorations (coming soon)</li>
                <li>⚡ Speed up recovery times and skip waiting periods</li>
              </ul>
            </motion.div>

            {/* Payment Requirements Info */}
            {(!isInWorldApp || !cavosAuth.isAuthenticated) && (
              <motion.div
                className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 mt-4 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="font-luckiest text-purple-800 mb-2 flex items-center gap-2">
                  🔒 Requirements
                </h4>
                <ul className="text-sm text-purple-700 font-rubik space-y-1">
                  {!isInWorldApp && (
                    <li>• Open this app in World App for payments</li>
                  )}
                  {!cavosAuth.isAuthenticated && (
                    <li>• Login with ByteBeasts account to save gems</li>
                  )}
                  <li>• Payments processed with USDC on Worldchain</li>
                </ul>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <Toaster
        position={position}
        toastOptions={{
          className: 'font-luckiest bg-cream text-dark border border-dark rounded-[5px] shadow-lg p-4',
          error: { duration: 3000 },
          success: { duration: 3000 }
        }}
      />

      {/* World App Modal */}
      <WorldAppModal
        isOpen={showWorldAppModal}
        onClose={() => setShowWorldAppModal(false)}
      />
    </div>
  );
}

export default GemShopScreen;