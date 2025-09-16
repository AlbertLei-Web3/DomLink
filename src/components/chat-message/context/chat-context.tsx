/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

interface ChatContextType {
  showChat: boolean;
  setShowChat: Dispatch<SetStateAction<boolean>>;
  isSyncingMessages: boolean;
  setIsSyncingMessages: Dispatch<SetStateAction<boolean>>;
  showOfferDialog: boolean;
  setShowOfferDialog: Dispatch<SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [showChat, setShowChat] = useState(false);
  const [isSyncingMessages, setIsSyncingMessages] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        showChat,
        setShowChat,
        isSyncingMessages,
        setIsSyncingMessages,
        showOfferDialog,
        setShowOfferDialog,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
