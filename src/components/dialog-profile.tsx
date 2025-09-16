import type React from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import useApp from "@/hooks/useApp";
import Avatar from "boring-avatars";
import { DEFAULT_COLORS_BORING_AVATAR, SUPPORTED_CHAINS } from "@/config";
import { extractCAIP10, shortenAddress } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Check,
  ClockIcon,
  Copy,
  Globe2Icon,
  User2Icon,
  ZapIcon,
} from "lucide-react";
import useCopyClipboard from "@/hooks/useCopyClipboard";
import { useCallback, useMemo } from "react";
import { useGetAllDomainsFromAddress } from "@/api/query";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

const DialogProfile: React.FC = () => {
  const { copied, handleCopyClipboard } = useCopyClipboard();
  const { isOpenProfile, setIsOpenProfile, selectedProfile } = useApp();
  const { data } = useGetAllDomainsFromAddress(
    selectedProfile ? `eip155:97476:${selectedProfile}` : ""
  );

  const listDomains = useMemo(() => {
    if (!data) return [];
    return data.map((domain) => {
      const caip10Extracted = extractCAIP10(domain.claimedBy);
      const networkName =
        SUPPORTED_CHAINS.find(
          (chain) => chain.id === caip10Extracted?.networkId
        )?.name || "Unknown";
      return {
        name: domain.name,
        user: caip10Extracted?.accountAddress || "Unknown",
        network: networkName,
        expiredAt: domain.expiresAt,
      };
    });
  }, [data]);

  const handleCopyAddress = useCallback(() => {
    handleCopyClipboard(selectedProfile || "");
  }, [selectedProfile, handleCopyClipboard]);

  return (
    <Dialog open={isOpenProfile} onOpenChange={setIsOpenProfile}>
      <DialogContent>
        <DialogHeader />
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-1 gap-4 justify-items-center">
              <Avatar
                name={selectedProfile || "unknown"}
                variant="beam"
                colors={DEFAULT_COLORS_BORING_AVATAR}
                size={80}
              />
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold">
                  {shortenAddress(selectedProfile || "", 6, 4)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="h-6 w-6 p-0 hover:bg-muted"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground">Domains</div>
              <Badge variant="secondary">{data?.length || 0} Total</Badge>
            </div>
            <ScrollArea className="max-h-[400px]">
              <div className="flex flex-col gap-4">
                {listDomains.length > 0 ? (
                  listDomains.map((domain) => (
                    <div
                      key={domain.name}
                      className="p-4 border rounded-lg bg-accent hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe2Icon size={16} />
                            <div className="font-semibold underline underline-offset-4">
                              {domain.name}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon size={14} />
                            <span className="text-xs text-muted-foreground">
                              {new Date(domain.expiredAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User2Icon size={16} />
                          <div className="text-sm">
                            {shortenAddress(domain.user, 6, 4)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ZapIcon size={16} />
                          <div className="text-sm">{domain.network}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    No domains found for this address.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogProfile;
