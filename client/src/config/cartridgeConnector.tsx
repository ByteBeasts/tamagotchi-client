import { Connector } from "@starknet-react/core";
import { ControllerConnector } from "@cartridge/connector";
import { ColorMode, SessionPolicies, ControllerOptions, } from "@cartridge/controller";
import { constants } from "starknet";

const { VITE_PUBLIC_DEPLOY_TYPE } = import.meta.env;

const CONTRACT_ADDRESS_ACHIEVEMENTS = '0x6846e1d528421a1569e36a3f80613f77e0d9f927e50967ada831347513f4c85'
const CONTRACT_ADDRESS_TAMAGOTCHI_SYSTEM = '0x8efc9411c660ef584995d8f582a13cac41aeddb6b9245b4715aa1e9e6a201e'
const CONTRACT_ADDRESS_PLAYER_SYSTEM = '0x5e79b9650cb00d19d21601c9c712654cb13daa3007fd78cce0e90051e46ec8a'

const policies: SessionPolicies = {
  contracts: {
    [CONTRACT_ADDRESS_TAMAGOTCHI_SYSTEM]: {
      methods: [
        { name: "awake", entrypoint: "awake" },
        { name: "clean", entrypoint: "clean" },
        { name: "feed", entrypoint: "feed" },
        { name: "get_beast_age", entrypoint: "get_beast_age" },
        { name: "get_beast_age_with_address", entrypoint: "get_beast_age_with_address" },
        { name: "get_timestamp_based_status", entrypoint: "get_timestamp_based_status" },
        { name: "get_timestamp_based_status_with_address", entrypoint: "get_timestamp_based_status_with_address" },
        { name: "pet", entrypoint: "pet" },
        { name: "play", entrypoint: "play" },
        { name: "revive", entrypoint: "revive" },
        { name: "set_beast_name", entrypoint: "set_beast_name" },
        { name: "sleep", entrypoint: "sleep" },
        { name: "spawn_beast", entrypoint: "spawn_beast" },
        { name: "spawn_beast_custom_status", entrypoint: "spawn_beast_custom_status" },
        { name: "update_beast", entrypoint: "update_beast" },
      ],
    },

    [CONTRACT_ADDRESS_PLAYER_SYSTEM]: {
      methods: [
        { name: "add_or_update_food_amount", entrypoint: "add_or_update_food_amount" },
        { name: "emit_player_push_token", entrypoint: "emit_player_push_token" },
        { name: "spawn_player", entrypoint: "spawn_player" },
        { name: "update_player_daily_streak", entrypoint: "update_player_daily_streak" },
        { name: "update_player_minigame_highest_score", entrypoint: "update_player_minigame_highest_score" },
        { name: "update_player_total_coins", entrypoint: "update_player_total_coins" },
        { name: "update_player_total_gems", entrypoint: "update_player_total_gems" },
        { name: "update_player_total_points", entrypoint: "update_player_total_points" },
      ],
    },

    [CONTRACT_ADDRESS_ACHIEVEMENTS]: {
      methods: [
        { name: "achieve_beast_chat", entrypoint: "achieve_beast_chat" },
        { name: "achieve_beast_clean", entrypoint: "achieve_beast_clean" },
        { name: "achieve_beast_feed", entrypoint: "achieve_beast_feed" },
        { name: "achieve_beast_pet", entrypoint: "achieve_beast_pet" },
        { name: "achieve_beast_sleep", entrypoint: "achieve_beast_sleep" },
        { name: "achieve_flappy_beast_highscore", entrypoint: "achieve_flappy_beast_highscore" },
        { name: "achieve_platform_highscore", entrypoint: "achieve_platform_highscore" },
        { name: "achieve_play_minigame", entrypoint: "achieve_play_minigame" },
        { name: "achieve_player_new_total_points", entrypoint: "achieve_player_new_total_points" },
        { name: "achieve_score_share", entrypoint: "achieve_score_share" },
        { name: "achieve_beast_share", entrypoint: "achieve_beast_share" },
      ],
    },
  },
}

// Controller basic configuration
const colorMode: ColorMode = "dark";
const theme = "bytebeasts-tamagotchi";
const namespace = "tamagotchi";
const slot = "tamagotchiv2";

const options: ControllerOptions = {
  chains: [
    {
      rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
    },
  ],
  defaultChainId: VITE_PUBLIC_DEPLOY_TYPE === 'mainnet' ? constants.StarknetChainId.SN_MAIN : constants.StarknetChainId.SN_SEPOLIA,
  policies,
  theme,
  colorMode,
  preset: "bytebeasts-tamagotchi",
  namespace: namespace,
  slot: slot,
};

const cartridgeConnector = new ControllerConnector(
  options,
) as never as Connector;

export default cartridgeConnector;
