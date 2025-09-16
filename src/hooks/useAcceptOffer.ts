import { DomaOrderbookSDK } from "@/classes/doma-orderbook";
import { DOMA_CONFIG_CLIENT, SUPPORTED_CHAINS } from "@/config";
import { useCallback } from "react";
import { useAccount, useChainId, useConnectorClient, useWalletClient } from "wagmi";
import type { WalletClient } from "viem";
import { viemToEthersSigner } from "@doma-protocol/orderbook-sdk";
import { BrowserProvider, type Eip1193Provider, type JsonRpcSigner } from "ethers";
import { domaTestnet } from "@/custom-chains/doma-testnet";
import { toast } from "sonner";

const useAcceptOffer = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  // 一些连接器（如 WalletConnect/CBW）下，useWalletClient 可能为 undefined。
  // 这里补充使用 useConnectorClient 获取连接器级别的钱包客户端。
  // On some connectors, useWalletClient may be undefined; useConnectorClient as a fallback.
  const { data: connectorClient } = useConnectorClient({ chainId: domaTestnet.id });
  // 当前钱包连接的链 ID（EVM 数字）/ Current connected chain id
  const currentChainId = useChainId();

  const getDomaClient = useCallback(() => {
    return new DomaOrderbookSDK(DOMA_CONFIG_CLIENT);
  }, []);

  const acceptOffer = useCallback(
    async (orderId: string, callbackOnSuccess?: () => void) => {
      // 预检 1：仅聚焦 DOMA Testnet，要求钱包链为 97476 / Preflight 1: Focus DOMA Testnet, require wallet on 97476
      if (currentChainId && currentChainId !== domaTestnet.id) {
        const currentChainName =
          SUPPORTED_CHAINS.find((c) => c.id === currentChainId)?.name ?? `${currentChainId}`;
        const targetChainName =
          SUPPORTED_CHAINS.find((c) => c.id === domaTestnet.id)?.name ?? `${domaTestnet.id}`;
        toast.error(
          `请先在钱包中手动切换到目标网络：${targetChainName}（当前：${currentChainName}）。\n` +
            `Please switch your wallet to the target network: ${targetChainName} (current: ${currentChainName}).`
        );
        return;
      }

      const chainId = `eip155:${domaTestnet.id}` as const;

      // 构造 signer（多重来源）/ Build signer from multiple sources
      const primaryClient: WalletClient | undefined =
        (walletClient as WalletClient | undefined) ?? (connectorClient as unknown as WalletClient | undefined);
      let signer: JsonRpcSigner | undefined = primaryClient
        ? viemToEthersSigner(primaryClient, chainId)
        : undefined;

      // 注入式钱包兜底 / Injected wallet fallback
      if (!signer && (globalThis as unknown as { ethereum?: Eip1193Provider })?.ethereum) {
        try {
          const provider = new BrowserProvider((globalThis as unknown as { ethereum: Eip1193Provider }).ethereum as Eip1193Provider);
          signer = await provider.getSigner();
        } catch {
          // ignore, 将在下方统一提示 / will toast below if still missing
        }
      }

      if (!signer) {
        toast.error(
          "未能获取钱包签名器，请在页面中点击连接钱包，或在钱包内授权当前站点后重试。\n" +
            "Could not obtain a wallet signer. Click Connect on this page or authorize this site in your wallet, then retry."
        );
        return;
      }

      const client = getDomaClient();

      return await client.acceptOffer({
        chainId,
        signer,
        params: {
          orderId,
        },
        onProgress: (progress) => {
          const isAllComplete = progress.every((p) => p.status === "complete");
          if (isAllComplete) {
            toast.success("Offer accepted successfully!");
            callbackOnSuccess?.();
          }
        },
      });
    },
    [getDomaClient, walletClient, connectorClient, isConnected, address, currentChainId]
  );

  return { acceptOffer };
};

export default useAcceptOffer;
