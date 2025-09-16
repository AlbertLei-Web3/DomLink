import {
  OrderbookType,
  viemToEthersSigner,
} from "@doma-protocol/orderbook-sdk";
import { useCallback } from "react";
import { DOMA_CONFIG_CLIENT, SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from "@/config";
import { useChainId, useWalletClient } from "wagmi";
import { domaTestnet } from "@/custom-chains/doma-testnet";
import { parseUnits } from "viem";
import { toast } from "sonner";
import { DomaOrderbookSDK } from "@/classes/doma-orderbook";

const useCreateOffer = () => {
  const { data: walletClient } = useWalletClient();
  // 当前钱包所连接的链 ID（EVM 数字），例如：DOMA Testnet=97476，Sepolia=11155111
  // The currently connected wallet chain id (EVM numeric), e.g. DOMA Testnet=97476, Sepolia=11155111
  const currentChainId = useChainId();

  const getDomaClient = useCallback(() => {
    return new DomaOrderbookSDK(DOMA_CONFIG_CLIENT);
  }, []);

  const createOffer = useCallback(
    async (
      tokenAddress: string,
      tokenId: string,
      currencyContractAddress: string,
      amount: string,
      duration: number,
      // 新增：目标链 ID（EVM 数字 ID），用于按域名链动态出价
      // Added: target EVM chain ID for dynamic per-domain offers
      targetChainId?: number,
      callbackOnSuccess?: () => void
    ) => {
      if (!walletClient) return;
      // 若未显式指定，默认使用 DOMA Testnet；否则使用传入的目标链 ID
      // Default to DOMA Testnet if not provided; otherwise, use specified target chain
      const effectiveChainNumeric = targetChainId ?? domaTestnet.id;
      const chainId = `eip155:${effectiveChainNumeric}` as const;

      // 出价前的手动切链校验（不自动切换，只提示用户）
      // Manual chain-switch preflight (do not auto switch, just inform the user)
      if (currentChainId && currentChainId !== effectiveChainNumeric) {
        const targetChainName =
          SUPPORTED_CHAINS.find((c) => c.id === effectiveChainNumeric)?.name ?? `${effectiveChainNumeric}`;
        const currentChainName =
          SUPPORTED_CHAINS.find((c) => c.id === currentChainId)?.name ?? `${currentChainId}`;

        // 以 Toast 的方式用中英双语提示用户先在钱包里手动切换到目标链
        // Show a bilingual toast instructing the user to switch network manually in wallet
        toast.error(
          `请先在钱包中手动切换到目标网络：${targetChainName}（当前：${currentChainName}）。\n` +
            `Please switch your wallet to the target network: ${targetChainName} (current: ${currentChainName}).`
        );
        return; // 中断本次出价，避免后续抛出 network changed 错误 / Abort to avoid network changed errors
      }

      const signer = viemToEthersSigner(walletClient, chainId);

      const client = getDomaClient();

      const isNativeToken =
        SUPPORTED_CURRENCIES.find((c) => c.value === currencyContractAddress)
          ?.label === "WETH";

      // 标记：是否已在进度回调内触发成功回调
      // Flag: whether success callback has been invoked inside onProgress
      let hasInvokedSuccessCallback = false;

      const result = await client.createOffer({
        signer,
        chainId,
        params: {
          orderbook: OrderbookType.DOMA,
          source: "domainLine",
          items: [
            {
              contract: tokenAddress,
              tokenId,
              currencyContractAddress,
              price: parseUnits(amount, isNativeToken ? 18 : 6).toString(),
              duration,
            },
          ],
        },
        onProgress: (progress) => {
          const isAllComplete = progress.every((p) => p.status === "complete");
          if (isAllComplete) {
            toast.success("Offer created successfully!");
            hasInvokedSuccessCallback = true;
            callbackOnSuccess?.();
          }
        },
      });

      // 兜底：若上面的进度回调未触发（某些钱包/环境下步骤状态非 complete），在这里补触发关闭等后续逻辑
      // Fallback: if onProgress never marked all steps complete, still trigger success callback here after a successful result
      if (!hasInvokedSuccessCallback) {
        callbackOnSuccess?.();
      }
      return result;
    },
    // 依赖 currentChainId，确保切链后提示逻辑使用最新链信息
    // Depend on currentChainId so preflight reflects the latest network
    [getDomaClient, walletClient, currentChainId]
  );

  return {
    createOffer,
  };
};

export default useCreateOffer;
