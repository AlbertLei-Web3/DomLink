import { DEFAULT_COLORS_BORING_AVATAR } from "@/config";
import Avatar from "boring-avatars";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import type { DecodedMessage, Dm } from "@xmtp/browser-sdk";
import useApp from "@/hooks/useApp";
import ChatListItemLoading from "./chat-list-item-loading";
import { shortenAddress } from "@/lib/utils";
import { useNavigate } from "react-router";

interface ChatListItemProps {
  isLoading: boolean;
  dm: Dm;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ isLoading, dm }) => {
  const navigate = useNavigate();
  const { xmtpClient } = useApp();
  const [userAddress, setUserAddress] = useState<string>("Unknown");
  const [latestMessage, setLatestMessage] = useState<string>("---");

  const handleLatestMessage = useCallback(
    (message: DecodedMessage) => {
      if (message && typeof message.content === "string") {
        const isCurrentUser = message.senderInboxId === xmtpClient?.inboxId;
        if (isCurrentUser) {
          if (message.content.split("::")[0] === "send_offer") {
            setLatestMessage("💌 Sent an offer");
          } else if (message.content.split("::")[0] === "accept_offer") {
            setLatestMessage("🎉 Accepted an offer");
          } else {
            setLatestMessage(String(message.content));
          }
        } else {
          if (message.content.split("::")[0] === "send_offer") {
            setLatestMessage("💌 Received an offer");
          } else if (message.content.split("::")[0] === "accept_offer") {
            setLatestMessage("🎉 Accepted your offer");
          } else {
            setLatestMessage(String(message.content));
          }
        }
      }
    },
    [xmtpClient?.inboxId]
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let streamController: AsyncIterator<any, any, any> | undefined;

    if (dm) {
      (async () => {
        streamController = await dm.stream({
          onValue: (message) => {
            handleLatestMessage(message);
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
  }, [dm, handleLatestMessage]);

  useEffect(() => {
    (async () => {
      const messages = await dm.messages();
      const lastStringMessage = [...messages]
        .reverse()
        .find((msg) => typeof msg.content === "string");

      if (lastStringMessage) {
        handleLatestMessage(lastStringMessage);
      }
    })();
  }, [dm, handleLatestMessage]);

  useEffect(() => {
    let isMounted = true;
    const fetchUserAddress = async () => {
      try {
        const inboxId = await dm.peerInboxId();
        const address = await xmtpClient?.preferences.inboxStateFromInboxIds([
          inboxId,
        ]);
        if (isMounted) {
          setUserAddress(
            address?.[0]?.identifiers?.[0]?.identifier || "Unknown"
          );
        }
      } catch {
        if (isMounted) {
          setUserAddress("Unknown");
        }
      }
    };
    if (dm && xmtpClient?.preferences) {
      fetchUserAddress();
    }
    return () => {
      isMounted = false;
    };
  }, [dm, xmtpClient?.preferences]);

  const handleNavigate = useCallback(() => {
    navigate(`?dm=${dm.id}&sender=${userAddress}`);
  }, [dm.id, navigate, userAddress]);

  if (isLoading) return <ChatListItemLoading />;
  return (
    <div
      className="flex items-center gap-4 p-4 hover:bg-accent border-b cursor-pointer transition-all"
      onClick={handleNavigate}
    >
      <Avatar
        name={userAddress}
        size={40}
        colors={DEFAULT_COLORS_BORING_AVATAR}
        className="min-w-[40px]"
        variant="beam"
      />
      <div>
        <div className="text-sm">{shortenAddress(userAddress)}</div>
        <div className="text-sm text-muted-foreground line-clamp-1">
          {latestMessage}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
