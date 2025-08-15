/**
 * Utility functions for data conversion between different formats
 */

/**
 * Convert hex value to number
 */
export const hexToNumber = (hexValue: string | number): number => {
  if (typeof hexValue === 'number') return hexValue;
  if (typeof hexValue === 'string' && hexValue.startsWith('0x')) {
    return parseInt(hexValue, 16);
  }
  if (typeof hexValue === 'string') {
    return parseInt(hexValue, 10);
  }
  return 0;
};

/**
 * Convert hex value to boolean
 */
export const hexToBool = (hexValue: string | boolean): boolean => {
  if (typeof hexValue === 'boolean') return hexValue;
  if (typeof hexValue === 'string') {
    if (hexValue === '0x1' || hexValue === '1') return true;
    if (hexValue === '0x0' || hexValue === '0') return false;
    return hexValue.toLowerCase() === 'true';
  }
  return false;
};

/**
 * Convert hex value to string (for beast names from Torii)
 */
export const hexToString = (hexValue: string | number): string => {
  if (!hexValue || hexValue === 0 || hexValue === '0x0') return '';
  
  try {
    // If it's already a string and not hex, return it
    if (typeof hexValue === 'string' && !hexValue.startsWith('0x')) {
      return hexValue;
    }
    
    // Convert hex to string
    let hex = hexValue.toString();
    if (hex.startsWith('0x')) {
      hex = hex.slice(2);
    }
    
    // Convert hex to ASCII string
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substr(i, 2), 16);
      if (charCode === 0) break; // Stop at null terminator
      str += String.fromCharCode(charCode);
    }
    return str.trim();
  } catch (error) {
    console.error('Failed to convert hex to string:', error);
    return '';
  }
};

/**
 * Convert string to hex (for sending to contracts)
 */
export const stringToHex = (str: string): string => {
  if (!str) return '0x0';
  
  let hex = '0x';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hex += charCode.toString(16).padStart(2, '0');
  }
  return hex;
};