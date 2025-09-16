import { cn } from "@/lib/utils";
import { useChatContext } from "../context/chat-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatListItem from "./chat-list-item";
import useApp from "@/hooks/useApp";
import { useEffect, useState } from "react";
import { type Dm } from "@xmtp/browser-sdk";
import { MessageCircle } from "lucide-react";
import ChatListItemLoading from "./chat-list-item-loading";

const ListChats = () => {
  const { showChat } = useChatContext();
  const { xmtpClient } = useApp();
  const [dms, setDms] = useState<Dm[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let streamController: AsyncIterator<any, any, any> | undefined;

    if (xmtpClient) {
      (async () => {
        streamController = await xmtpClient.conversations.stream<Dm<string>>({
          onValue: (value) => {
            setDms((prevDms) => [...prevDms, value]);
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
  }, [xmtpClient]);

  useEffect(() => {
    if (xmtpClient) {
      setLoading(true);
      (async () => {
        const allDms = await xmtpClient.conversations.list();
        setDms(allDms as Dm[]);
        setLoading(false);
      })();
    } else {
      setDms([]);
    }
  }, [xmtpClient]);

  return (
    <div
      className={cn(
        "flex flex-col flex-none border rounded-xl bg-white dark:bg-background transition-all w-full md:w-[400px] h-full max-h-[calc(100%_-_var(--spacing)*2)]",
        showChat ? "hidden md:block" : "block"
      )}
    >
      <div className="font-semibold text-2xl p-4">Chats</div>
      <ScrollArea className="flex-1 h-[calc(100%_-_64px)]">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <ChatListItemLoading key={index} />
          ))
        ) : dms.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-[calc(100vh_-_240px)]">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No chats yet</h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Start a conversation to see your chats appear here. Connect with
              others and begin messaging.
            </p>
          </div>
        ) : (
          dms.map((dm) => (
            <ChatListItem key={dm.id} isLoading={false} dm={dm} />
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default ListChats;
