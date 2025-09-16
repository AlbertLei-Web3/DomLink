import type { Message } from "@/components/chat-message/types";
import { Button } from "@/components/ui/button";
import { DEFAULT_COLORS_BORING_AVATAR } from "@/config";
import Avatar from "boring-avatars";
import { TimerIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import useAcceptOffer from "@/hooks/useAcceptOffer";
import { toast } from "sonner";

interface ChatProps {
  message: Message;
  handleSendMessage?: (content: string) => void;
}

interface ChatWrapperProps {
  isCurrentUser: boolean;
  message: Message;
  children: React.ReactNode;
}

const ChatWrapper = ({
  isCurrentUser,
  message,
  children,
}: ChatWrapperProps) => {
  return (
    <div
      className={`flex gap-3 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isCurrentUser && (
        <Avatar
          name={message.sender}
          colors={DEFAULT_COLORS_BORING_AVATAR}
          size={24}
          variant="beam"
        />
      )}
      {children}

      {isCurrentUser && (
        <Avatar
          name={message.sender}
          colors={DEFAULT_COLORS_BORING_AVATAR}
          size={24}
          variant="beam"
        />
      )}
    </div>
  );
};

const AcceptOfferChat: React.FC<ChatProps> = ({ message }) => {
  const { address } = useAccount();
  const parts = message.content.split("::");
  const domainName = parts[2];
  const currency = parts[3];
  const amount = parts[4];
  const acceptorAddress = parts[5];

  const isCurrentUser = useMemo(() => {
    return acceptorAddress?.toLowerCase() === address?.toLowerCase();
  }, [acceptorAddress, address]);

  return (
    <ChatWrapper isCurrentUser={isCurrentUser} message={message}>
      <div
        className={`space-y-2 p-4 border-2 rounded-lg border-dashed ${
          isCurrentUser
            ? "bg-primary text-primary-foreground border-accent"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <div className="text-sm">
          {isCurrentUser
            ? "✅ You accepted the offer for"
            : "✅ Offer accepted for"}
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-lg">{domainName}</div>
          <div>
            <span className="font-semibold text-4xl">{amount}</span>{" "}
            <span className="text-xs">{currency}</span>
          </div>
        </div>
      </div>
    </ChatWrapper>
  );
};

const OfferChat: React.FC<ChatProps> = ({ message, handleSendMessage }) => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const parts = message.content.split("::");
  const orderId = parts[1];
  const domainName = parts[2];
  const currency = parts[3];
  const amount = parts[4];
  const offererAddress = parts[5];
  const expirationUnixSeconds = parseInt(parts[6], 10) * 1000; // Convert to milliseconds
  const timeDifference = formatDistanceToNow(expirationUnixSeconds, {
    addSuffix: true,
  });
  const isExpired = Date.now() > expirationUnixSeconds;
  const ownedByCurrentUser =
    offererAddress.toLowerCase() === address?.toLowerCase();

  const { acceptOffer } = useAcceptOffer();

  const handleAcceptOffer = useCallback(async () => {
    try {
      setIsLoading(true);
      await acceptOffer(orderId, () => {
        handleSendMessage?.(
          `accept_offer::${orderId}::${domainName}::${currency}::${amount}::${address}`
        );
      });
      // 无论回调是否触发，完成后都解除 loading，避免 UI 停滞
      // Always clear loading after attempt to avoid stuck button
      setIsLoading(false);
    } catch (err) {
      toast.error("Failed to accept offer");
      console.log(err);
      setIsLoading(false);
    }
  }, [
    acceptOffer,
    address,
    amount,
    currency,
    domainName,
    handleSendMessage,
    orderId,
  ]);

  return (
    <ChatWrapper message={message} isCurrentUser={ownedByCurrentUser}>
      <div
        className={`space-y-2 p-4 border-2 rounded-lg border-dashed ${
          ownedByCurrentUser
            ? "bg-primary text-primary-foreground border-accent"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <div className="text-sm">
          {ownedByCurrentUser
            ? "🚀 You sent an offer for"
            : "🎉 You received an offer for"}
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-lg">{domainName}</div>
          <div>
            <span className="font-semibold text-4xl">{amount}</span>{" "}
            <span className="text-xs">{currency}</span>
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-0.5 text-xs">
              <TimerIcon size={12} />
              {!isExpired && <div>Offer expires {timeDifference}</div>}
              {isExpired && <div>Offer expired</div>}
            </div>
          </div>
        </div>
        {!ownedByCurrentUser && (
          <Button
            disabled={isExpired || isLoading}
            className="w-full"
            onClick={handleAcceptOffer}
          >
            {isExpired ? "Expired" : "Accept Offer"}
          </Button>
        )}
      </div>
    </ChatWrapper>
  );
};

const Chat: React.FC<ChatProps> = ({ message, handleSendMessage }) => {
  const { address } = useAccount();
  const isCurrentUser = useMemo(() => {
    return message.sender === address;
  }, [message, address]);

  const isOfferChat = useMemo(() => {
    if (typeof message.content !== "string") return false;
    const parts = message.content.split("::");
    if (parts.length !== 7) return false;
    if (parts[0] !== "send_offer") return false;
    return true;
  }, [message]);

  const isAcceptOfferChat = useMemo(() => {
    if (typeof message.content !== "string") return false;
    const parts = message.content.split("::");
    if (parts.length !== 6) return false;
    if (parts[0] !== "accept_offer") return false;
    return true;
  }, [message]);

  if (isAcceptOfferChat) return <AcceptOfferChat message={message} />;

  if (isOfferChat)
    return (
      <OfferChat message={message} handleSendMessage={handleSendMessage} />
    );

  return (
    <ChatWrapper isCurrentUser={isCurrentUser} message={message}>
      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 ${
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <span className="text-xs opacity-70">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </ChatWrapper>
  );
};

export default Chat;
