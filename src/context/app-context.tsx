import { createContext } from "react";
import { Client } from "@xmtp/browser-sdk";

type AppContextType = {
  xmtpClient: Client | null;
  setXmtpClient: (client: Client | null) => void;
  isOpenProfile: boolean;
  setIsOpenProfile: (open: boolean) => void;
  selectedProfile?: string;
  setSelectedProfile: (profile?: string) => void;
  isLogin: boolean;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

