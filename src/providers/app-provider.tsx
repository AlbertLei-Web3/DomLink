import { AppContext } from "@/context/app-context";
import { Client } from "@xmtp/browser-sdk";
import { useMemo, useState, type ReactNode } from "react";
import { useAccount } from "wagmi";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | undefined>(
    undefined
  );
  const { address } = useAccount();

  const isLogin = useMemo(() => {
    return Boolean(xmtpClient && address);
  }, [address, xmtpClient]);

  return (
    <AppContext.Provider
      value={{
        xmtpClient,
        setXmtpClient,
        isOpenProfile,
        setIsOpenProfile,
        selectedProfile,
        setSelectedProfile,
        isLogin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
