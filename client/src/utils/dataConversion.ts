/**
 * Utility functions for data conversion between different formats
 */
import { shortString } from 'starknet';

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
      const charCode = parseInt(hex.substring(i, i + 2), 16);
      if (charCode === 0) break; // Stop at null terminator
      // Skip any non-printable characters (including null chars)
      if (charCode >= 32 && charCode <= 126) {
        str += String.fromCharCode(charCode);
      }
    }
    
    // Clean the string: remove all non-printable characters and trim
    const cleanedStr = str.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
    
    // If after cleaning we only have null or empty string, return empty
    if (!cleanedStr || cleanedStr.length === 0) {
      return '';
    }
    
    return cleanedStr;
  } catch (error) {
    console.error('Failed to convert hex to string:', error);
    return '';
  }
};

/**
 * Convert felt252 number to string using Starknet's official utilities
 * Uses the shortString utilities from the Starknet library
 */
export const felt252ToString = (felt252Value: string | number): string => {
  if (!felt252Value || felt252Value === 0 || felt252Value === '0x0') return '';
  
  try {
    // Convert the felt252 to a hex string if it's a number
    let feltString = felt252Value.toString();
    if (typeof felt252Value === 'number') {
      feltString = '0x' + felt252Value.toString(16);
    }
    
    // Use Starknet's official decoding function
    const decodedString = shortString.decodeShortString(feltString);
    
    return decodedString.trim();
  } catch (error) {
    console.error('Failed to convert felt252 to string using Starknet utilities:', error, { felt252Value });
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