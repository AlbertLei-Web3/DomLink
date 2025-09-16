import { useChatContext } from "@/components/chat-message/context/chat-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEFAULT_COLORS_BORING_AVATAR } from "@/config";
import useApp from "@/hooks/useApp";
import { shortenAddress } from "@/lib/utils";
import Avatar from "boring-avatars";
import {
  ArrowLeft,
  ForwardIcon,
  LogOutIcon,
  RotateCcwIcon,
  User2Icon,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";

const HeaderChat = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setIsSyncingMessages, setShowOfferDialog } = useChatContext();
  const { setIsOpenProfile, setSelectedProfile } = useApp();

  const user = useMemo(
    () => searchParams.get("sender") || "---",
    [searchParams]
  );

  const handleViewProfile = useCallback(() => {
    setSelectedProfile(user);
    setIsOpenProfile(true);
  }, [setIsOpenProfile, setSelectedProfile, user]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => navigate("/")}
          >
            <ArrowLeft />
          </Button>
          <Avatar
            name={user}
            colors={DEFAULT_COLORS_BORING_AVATAR}
            size={40}
            variant="beam"
          />
        </div>
        <div className="hidden md:block">
          <div className="text-sm">Unknown</div>
          <div className="text-xs text-muted-foreground line-clamp-1">
            {shortenAddress(user)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleViewProfile}>
              <User2Icon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View Profile</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowOfferDialog(true)}
            >
              <ForwardIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send Offers</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSyncingMessages(true)}
            >
              <RotateCcwIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sync Messages</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <LogOutIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Exit chat</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default HeaderChat;
