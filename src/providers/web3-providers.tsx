import { WagmiProvider, createConfig, http } from "wagmi";
import {
  baseSepolia,
  curtis,
  sepolia,
  shibariumTestnet,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import type React from "react";
import { domaTestnet } from "@/custom-chains/doma-testnet";

const config = createConfig(
  getDefaultConfig({
    chains: [domaTestnet, sepolia, baseSepolia, shibariumTestnet, curtis],
    transports: {
      [domaTestnet.id]: http(),
      [sepolia.id]: http(),
      [baseSepolia.id]: http(),
      [shibariumTestnet.id]: http(),
      [curtis.id]: http(),
    },
    walletConnectProjectId: import.meta.env.VITE_REWOWN_PROJECT_ID,
    appName: "domainLine",
  })
);

const queryClient = new QueryClient();

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
