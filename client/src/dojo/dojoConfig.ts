import { createDojoConfig } from "@dojoengine/core";

import { manifest } from "../config/manifest";

const {
    VITE_PUBLIC_NODE_URL,
    VITE_PUBLIC_TORII,
  } = import.meta.env;

export const dojoConfig = createDojoConfig({
    manifest,
    rpcUrl: VITE_PUBLIC_NODE_URL || '',
    toriiUrl: VITE_PUBLIC_TORII || '',
});