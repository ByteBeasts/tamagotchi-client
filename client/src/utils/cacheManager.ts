/**
 * Cache management utilities for WorldApp
 * Handles cache clearing and version management to prevent stale content
 */

const CACHE_VERSION_KEY = 'bytebeasts-cache-version';
// This will be replaced at build time by Vite
const CURRENT_VERSION = `${import.meta.env.VITE_APP_VERSION || '0.0.0'}-${Date.now()}`;

/**
 * Checks if we're running in WorldApp
 */
export function isInWorldApp(): boolean {
  return navigator.userAgent.includes('WorldApp') || 
         navigator.userAgent.includes('World App') ||
         (window as any).WorldApp !== undefined;
}

/**
 * Gets the stored cache version
 */
function getStoredVersion(): string | null {
  try {
    return localStorage.getItem(CACHE_VERSION_KEY);
  } catch {
    return null;
  }
}

/**
 * Updates the stored cache version
 */
function updateStoredVersion(): void {
  try {
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION);
  } catch (error) {
    console.warn('Failed to update cache version:', error);
  }
}

/**
 * Clears all caches (service worker caches)
 */
async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }
}

/**
 * Unregisters all service workers
 */
async function unregisterServiceWorkers(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('✅ All service workers unregistered');
    } catch (error) {
      console.error('Failed to unregister service workers:', error);
    }
  }
}

/**
 * Forces a hard reload of the page
 */
function forceReload(): void {
  // Use location.href to force a complete reload
  window.location.href = window.location.href;
}

/**
 * Checks and manages cache version
 * Clears cache and reloads if version mismatch is detected
 */
export async function checkCacheVersion(): Promise<void> {
  const storedVersion = getStoredVersion();
  
  // If no stored version or version mismatch
  if (!storedVersion || storedVersion !== CURRENT_VERSION) {
    console.log('🔄 Cache version mismatch detected, clearing cache...');
    console.log(`  Stored: ${storedVersion || 'none'}`);
    console.log(`  Current: ${CURRENT_VERSION}`);
    
    // Clear everything
    await clearAllCaches();
    await unregisterServiceWorkers();
    
    // Update version
    updateStoredVersion();
    
    // If in WorldApp, force reload to get fresh content
    if (isInWorldApp()) {
      console.log('🌍 Running in WorldApp, forcing reload...');
      setTimeout(() => {
        forceReload();
      }, 100);
    }
  }
}

/**
 * Manual cache clear function (can be called from UI)
 */
export async function clearCacheManually(): Promise<void> {
  console.log('🧹 Manual cache clear initiated...');
  
  // Clear all caches
  await clearAllCaches();
  await unregisterServiceWorkers();
  
  // Clear local storage version to force update on next load
  try {
    localStorage.removeItem(CACHE_VERSION_KEY);
  } catch {}
  
  // Force reload
  setTimeout(() => {
    forceReload();
  }, 100);
}

/**
 * Listens for service worker updates and prompts user
 */
export function listenForUpdates(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 New service worker activated');
      
      // In WorldApp, auto-reload on update
      if (isInWorldApp()) {
        window.location.reload();
      }
    });
  }
}