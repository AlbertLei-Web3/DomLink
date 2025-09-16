import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import type { Identifier } from "@xmtp/browser-sdk";
import useApp from "@/hooks/useApp";
import { Loader2 } from "lucide-react";
import NotRegistered from "./chat-message/components/message/components/not-registered";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface DialogCheckingDMProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userAddress?: string;
}

const DialogCheckingDM: React.FC<DialogCheckingDMProps> = ({
  open,
  onOpenChange,
  userAddress,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canSentMessage, setCanSentMessage] = useState<boolean>(false);
  const { xmtpClient } = useApp();
  const navigate = useNavigate();

  const initializedDm = useCallback(async () => {
    if (userAddress) {
      const identifier: Identifier = {
        identifier: userAddress,
        identifierKind: "Ethereum",
      };
      const inboxId = await xmtpClient?.findInboxIdByIdentifier(identifier);
      if (inboxId) {
        const conversation = await xmtpClient?.conversations.newDm(
          inboxId || ""
        );
        onOpenChange(false);
        navigate(`?dm=${conversation?.id}&sender=${userAddress}`);
      } else {
        toast.error("Failed to find inbox ID for the user.");
      }
    }
  }, [userAddress, xmtpClient, onOpenChange, navigate]);

  useEffect(() => {
    if (userAddress && xmtpClient) {
      (async () => {
        setIsLoading(true);
        const identifier: Identifier = {
          identifier: userAddress,
          identifierKind: "Ethereum",
        };
        const canMessage = await xmtpClient?.canMessage([identifier]);
        if (canMessage?.get(userAddress.toLowerCase())) {
          setCanSentMessage(true);
          await initializedDm();
        } else {
          setCanSentMessage(false);
        }
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [initializedDm, onOpenChange, userAddress, xmtpClient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle />
        </DialogHeader>
        {isLoading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking DM capability...</span>
          </div>
        )}
        {!isLoading && !canSentMessage && <NotRegistered />}
      </DialogContent>
    </Dialog>
  );
};

export default DialogCheckingDM;
