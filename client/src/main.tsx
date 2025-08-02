import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { posthogInstance } from "./context/PosthogConfig";
import { PostHogProvider } from 'posthog-js/react';
import { MusicProvider } from "./context/MusicContext";
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
import { MiniKit } from '@worldcoin/minikit-js';

// Dojo 
import { init } from "@dojoengine/sdk";
import { DojoSdkProvider } from "@dojoengine/sdk/react";
import { dojoConfig } from "./dojo/dojoConfig";
import type { SchemaType } from "./dojo/models.gen";
import { setupWorld } from "./dojo/contracts.gen";

// App Entry
import Main from "../src/app/App";

// Styles
import "./global.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Eruda for debugging (especially useful in World App)
if (typeof window !== 'undefined') {
  // Force Eruda in World App or development
  const isWorldApp = navigator.userAgent.includes('WorldApp') || navigator.userAgent.includes('World App');
  const isDev = import.meta.env.DEV;
  
  if (isWorldApp || isDev) {
    console.log('🔧 Loading Eruda for debugging...');
    import('eruda').then((eruda: any) => {
      eruda.default.init();
      console.log('✅ Eruda initialized');
    }).catch((err: any) => {
      console.log('❌ Failed to load Eruda:', err);
    });
  }
}

// PWA Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { type: "module" })
      .then((registration) => {
        console.log("ServiceWorker registration successful:", registration);
      })
      .catch((error) => {
        console.log("ServiceWorker registration failed:", error);
      });
  });
}

// Init Dojo
async function main() {
  const sdk = await init<SchemaType>({
    client: {
      toriiUrl: dojoConfig.toriiUrl,
      relayUrl: dojoConfig.relayUrl,
      worldAddress: dojoConfig.manifest.world.address,
    },
    domain: {
      name: "ByteBeasts Tamagotchi",
      version: "1.0",
      chainId: "KATANA",
      revision: "1",
    },
  });

  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found");

  // Install MiniKit before rendering
  if (typeof window !== 'undefined') {
    MiniKit.install();
    console.log('🌍 MiniKit.install() called');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <MiniKitProvider>
        <DojoSdkProvider sdk={sdk} dojoConfig={dojoConfig} clientFn={setupWorld}>
          <MusicProvider>
            {posthogInstance.initialized && posthogInstance.client ? (
              <PostHogProvider client={posthogInstance.client}>
                <Main />
              </PostHogProvider>
            ) : (
              <Main />
            )}
          </MusicProvider>
        </DojoSdkProvider>
      </MiniKitProvider>
    </StrictMode>
  );
}

main().catch((error) => {
  console.error("Failed to initialize the application:", error);
});