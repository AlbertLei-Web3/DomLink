import { cn } from "@/lib/utils";
import { useChatContext } from "../../context/chat-context";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Message } from "../../types";
import Chat from "./components/chat";
import HeaderChat from "./components/header-chat";
import InputChat from "./components/input-chat";
import { useSearchParams } from "react-router";
import useApp from "@/hooks/useApp";
import { DecodedMessage, Dm } from "@xmtp/browser-sdk";
import { useAccount } from "wagmi";
import DefaultScreen from "./components/default-screen";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import DialogSendOffer from "@/components/dialog-send-offer";

const MessageComponent = () => {
  const [searchParams] = useSearchParams();
  const [dm, setDm] = useState<Dm | null>(null);
  const { showChat, setShowChat, isSyncingMessages, setIsSyncingMessages } =
    useChatContext();
  const { xmtpClient } = useApp();
  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const { address } = useAccount();
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);

  const getCurrentUser = useCallback(
    (peerInboxId: string) => {
      return xmtpClient?.inboxId === peerInboxId;
    },
    [xmtpClient?.inboxId]
  );

  const groupedMessages: Record<string, Message[]> = useMemo(() => {
    return messages.reduce((acc: Record<string, Message[]>, msg) => {
      const dateKey = new Date(Number(msg.sentAtNs) / 1_000_000)
        .toISOString()
        .split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push({
        id: msg.id,
        content: msg.content as string,
        sender: getCurrentUser(msg.senderInboxId)
          ? address || "Unknown"
          : searchParams.get("sender") || "Unknown",
        timestamp: new Date(Number(msg.sentAtNs) / 1_000_000),
      });
      return acc;
    }, {});
  }, [address, getCurrentUser, messages, searchParams]);

  useEffect(() => {
    if (dm && isSyncingMessages) {
      dm.sync()
        .catch(() => {
          toast.error("Failed to sync messages. Please try again.");
        })
        .finally(() => {
          setIsSyncingMessages(false);
        });
    }
  }, [dm, isSyncingMessages, setIsSyncingMessages]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let streamController: AsyncIterator<any, any, any> | undefined;

    if (dm) {
      (async () => {
        streamController = await dm.stream({
          onValue: (message) => {
            if (message && typeof message.content === "string") {
              setMessages((prevMessages) => [...prevMessages, message]);
            }
          },
          onError: (err) => {
            console.error("Stream error:", err);
          },
        });
      })();
    }

    return () => {
      if (streamController && typeof streamController.return === "function") {
        streamController.return();
      }
    };
  }, [dm]);

  useEffect(() => {
    if (searchParams.get("dm") && searchParams.get("sender") && xmtpClient) {
      setIsSyncingMessages(false);
      setShowChat(true);
      (async () => {
        const conversation = await xmtpClient.conversations.getConversationById(
          searchParams.get("dm") || ""
        );
        setDm(conversation as Dm);
        const messages = await conversation?.messages();
        const cleanMessages = messages?.filter(
          (msg) => typeof msg.content === "string"
        );
        setMessages(cleanMessages || []);
      })();
    } else {
      setDm(null);
      setMessages([]);
      setShowChat(false);
    }
  }, [searchParams, setIsSyncingMessages, setShowChat, xmtpClient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isVisible = useMemo(() => {
    return searchParams.get("dm") && searchParams.get("sender") && xmtpClient;
  }, [searchParams, xmtpClient]);

  const handleSendMessage = useCallback(
    (message: string) => {
      if (dm && message.trim() !== "") {
        setLoadingSendMessage(true);
        dm.send(message.trim())
          .catch(() => {
            toast.error("Failed to send message. Please try again.");
          })
          .finally(() => {
            setLoadingSendMessage(false);
          });
      }
    },
    [dm]
  );

  return (
    <div
      className={cn(
        "relative flex-1 border p-4 rounded-xl bg-white dark:bg-background transition-all w-full max-h-[calc(100%_-_var(--spacing)*2)]",
        showChat ? "block" : "hidden md:block"
      )}
    >
      {isSyncingMessages && (
        <div className="absolute top-0 left-0 w-full h-full bg-background/50 z-10 pointer-events-none transition-opacity backdrop-blur-xs">
          <div className="flex items-center justify-center h-full gap-2">
            <Loader size={16} className="animate-spin" />
            <div className="text-sm">Syncing Message...</div>
          </div>
        </div>
      )}
      {isVisible && (
        <>
          <HeaderChat />
          <div className="flex flex-col h-[calc(100%_-_48px)] mt-4">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date} className="space-y-2">
                  <div className="text-center text-sm text-muted-foreground">
                    {new Date(date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  {msgs.map((msg) => (
                    <Chat
                      key={msg.id}
                      message={msg}
                      handleSendMessage={handleSendMessage}
                    />
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4">
              <InputChat
                onSendMessageFallback={handleSendMessage}
                loading={loadingSendMessage}
              />
            </div>
          </div>
        </>
      )}
      {!isVisible && <DefaultScreen />}
      <DialogSendOffer callbackOnSuccess={handleSendMessage} />
    </div>
  );
};

export default MessageComponent;
