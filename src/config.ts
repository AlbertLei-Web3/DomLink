import { domaTestnet } from "./custom-chains/doma-testnet";
import { baseSepolia, curtis, sepolia, shibariumTestnet } from "wagmi/chains";

export const DEFAULT_COLORS_BORING_AVATAR = [
  "#92A1C6",
  "#146A7C",
  "#F0AB3D",
  "#C271B4",
  "#C20D90",
];

export const BASE_DOMAIN_API_URL = "https://api-testnet.doma.xyz/graphql";

export const SUPPORTED_CHAINS = [
  domaTestnet,
  baseSepolia,
  curtis,
  sepolia,
  shibariumTestnet,
];

export const SUPPORTED_CURRENCIES = [
  {
    value: "0x6f898cd313dcEe4D28A87F675BD93C471868B0Ac",
    label: "WETH",
  },
  {
    value: "0x2f3463756C59387D6Cd55b034100caf7ECfc757b",
    label: "USDC",
  },
];

export const EXPIRATION_OPTIONS = [
  { label: "1 Day", value: "1" },
  { label: "3 Days", value: "3" },
  { label: "7 Days", value: "7" },
  { label: "15 Days", value: "15" },
  { label: "30 Days", value: "30" },
];

export const DOMA_CONFIG_CLIENT = {
  apiClientOptions: {
    baseUrl: "https://api-testnet.doma.xyz",
    defaultHeaders: {
      "Api-Key": import.meta.env.VITE_DOMA_API_KEY || "",
    },
  },
  source: "domainLine",
  chains: SUPPORTED_CHAINS,
};
