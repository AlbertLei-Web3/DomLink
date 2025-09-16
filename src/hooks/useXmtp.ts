import { Client, type Signer } from "@xmtp/browser-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toBytes } from "viem";
import { useAccount, useSignMessage } from "wagmi";
import useApp from "./useApp";
import { toast } from "sonner";

const useXmtp = () => {
  const [isLoadingXmtp, setIsLoadingXmtp] = useState(false);
  const { setXmtpClient, xmtpClient } = useApp();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const signer: Signer = useMemo(() => {
    return {
      type: "EOA",
      getIdentifier: () => ({
        identifier: address as string,
        identifierKind: "Ethereum",
      }),
      signMessage: async (message: string): Promise<Uint8Array> => {
        const signature = await signMessageAsync({
          account: address,
          message,
        });
        return toBytes(signature);
      },
    };
  }, [address, signMessageAsync]);

  const connectXmtp = useCallback(async () => {
    if (!address) return;
    setIsLoadingXmtp(true);
    try {
      const canMessage = await Client.canMessage([
        { identifier: address as string, identifierKind: "Ethereum" },
      ]);
      if (canMessage.get(address as string)) {
        const existingClient = await Client.build(
          { identifier: address as string, identifierKind: "Ethereum" },
          { env: "dev" }
        );
        setXmtpClient(existingClient);
      } else {
        const newClient = await Client.create(signer, { env: "dev" });
        console.log("Created new XMTP client");
        setXmtpClient(newClient);
      }
    } catch (err) {
      console.error("Failed to connect to XMTP:", err);
      toast.error("Failed to connect to XMTP");
    } finally {
      setIsLoadingXmtp(false);
    }
  }, [address, setXmtpClient, signer]);

  useEffect(() => {
    if (!address) {
      setXmtpClient(null);
    }
  }, [address, setXmtpClient]);

  useEffect(() => {
    if (address && !xmtpClient) {
      connectXmtp();
    }
  }, [address, xmtpClient, connectXmtp, setXmtpClient]);

  return {
    isLoadingXmtp,
  };
};

export default useXmtp;
