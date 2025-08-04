// components/shared/BackButton.tsx

import { motion } from "framer-motion";
import closeIcon from "../../assets/icons/extras/icon-close.png";

interface BackButtonProps {
 onClick: () => void;
 className?: string;
 size?: 'sm' | 'md' | 'lg';
 variant?: 'floating' | 'inline';
}

/**
* Reusable back button component with close icon
* Consistent styling across all screens
*/
export function BackButton({ 
 onClick, 
 className = "",
 size = 'md',
 variant = 'floating'
}: BackButtonProps) {
 
 const sizeClasses = {
   sm: 'w-10 h-10',
   md: 'w-12 h-12', 
   lg: 'w-14 h-14'
 };

 const iconSizeClasses = {
   sm: 'w-8 h-8',
   md: 'w-10 h-10',
   lg: 'w-12 h-12'
 };

 const variantClasses = {
   floating: 'absolute top-12 left-2 z-20',
   inline: 'relative'
 };

 return (
   <motion.button
     onClick={onClick}
     className={`
       flex items-center justify-center 
       ${sizeClasses[size]} 
       ${variantClasses[variant]}
       transition-all duration-200
       ${className}
     `}
     initial={{ opacity: 0, x: -20 }}
     animate={{ opacity: 1, x: 0 }}
     transition={{ delay: 0.2 }}
     whileHover={{ scale: 1.05 }}
     whileTap={{ scale: 0.95 }}
     aria-label="Go back"
   >
     <img 
       src={closeIcon} 
       alt="Close" 
       className={`${iconSizeClasses[size]} object-contain`}
     />
   </motion.button>
 );
}

export default BackButton;