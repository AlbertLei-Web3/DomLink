import { useCallback, useMemo, useState } from "react";
import { useChatContext } from "./chat-message/context/chat-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useSearchParams } from "react-router";
import { useGetAllDomainsFromAddress } from "@/api/query";
import {
  EXPIRATION_OPTIONS,
  SUPPORTED_CHAINS,
  SUPPORTED_CURRENCIES,
} from "@/config";
import { cn, extractCAIP10, shortenAddress } from "@/lib/utils";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  Globe2Icon,
  User2Icon,
  ZapIcon,
} from "lucide-react";
import { InputWithSelect } from "./input-with-select";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import useCreateOffer from "@/hooks/useCreateOffer";
import {
  DomaOrderbookError,
  DomaOrderbookErrorCode,
} from "@doma-protocol/orderbook-sdk";
import { useAccount } from "wagmi";
import { toast } from "sonner";

interface Domain {
  name: string;
  user: string;
  network: string;
  expiredAt: string;
  tokenAddress: string;
  tokenId: string;
  // 新增：域名所在链的 EVM 链 ID（如 DOMA Testnet=97476，Sepolia=11155111）
  // Added: EVM chain ID where the domain contract lives (e.g., DOMA Testnet=97476, Sepolia=11155111)
  chainId: number;
}

interface DialogSendOfferProps {
  callbackOnSuccess?: (content: string) => void;
}

const DialogSendOffer: React.FC<DialogSendOfferProps> = ({
  callbackOnSuccess,
}) => {
  const { address } = useAccount();
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);
  const { showOfferDialog, setShowOfferDialog } = useChatContext();
  const [searchParams] = useSearchParams();
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [formOffer, setFormOffer] = useState({
    amount: "",
    currency: SUPPORTED_CURRENCIES[1].value,
    expiration: "7",
  });
  const { createOffer } = useCreateOffer();

  const rAddress = useMemo(() => {
    return searchParams.get("sender");
  }, [searchParams]);
  const { data } = useGetAllDomainsFromAddress(
    rAddress ? `eip155:97476:${rAddress}` : ""
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
        tokenAddress: domain?.tokens[0]?.tokenAddress,
        tokenId: domain?.tokens[0]?.tokenId,
        // 这里带出域名的链 ID，后续出价时按该链动态设置 chainId
        // Carry the domain's chain ID so the offer flow can target the correct chain dynamically
        chainId: caip10Extracted?.networkId as number,
      };
    });
  }, [data]);

  const handleSendOffer = useCallback(async () => {
    try {
      setIsLoadingOffer(true);
      if (!selectedDomain) return;
      if (!formOffer.amount) return;
      const currencyName = SUPPORTED_CURRENCIES.find(
        (c) => c.value === formOffer.currency
      )?.label;
      if (!currencyName) return;
      const result = await createOffer(
        selectedDomain?.tokenAddress || "",
        selectedDomain?.tokenId || "",
        formOffer.currency,
        formOffer.amount,
        Number(formOffer.expiration) * 24 * 60 * 60 * 1000,
        // 新增参数：按所选域名的链 ID 动态出价
        // New param: dynamically target the selected domain's chain
        selectedDomain?.chainId as number,
        () => {
          setShowOfferDialog(false);
          setSelectedDomain(null);
          setFormOffer({
            amount: "",
            currency: SUPPORTED_CURRENCIES[1].value,
            expiration: "7",
          });
        }
      );
      const expirationUnixSeconds = Math.floor(
        (Date.now() + Number(formOffer.expiration) * 24 * 60 * 60 * 1000) / 1000
      );
      const contentMessage = `send_offer::${result?.orders?.[0]?.orderId}::${selectedDomain.name}::${currencyName}::${formOffer.amount}::${address}::${expirationUnixSeconds}`;
      callbackOnSuccess?.(contentMessage);
      setIsLoadingOffer(false);
    } catch (error) {
      setIsLoadingOffer(false);
      toast.error("Failed to send offer");
      if (error instanceof DomaOrderbookError) {
        switch (error.code) {
          case DomaOrderbookErrorCode.SIGNER_NOT_PROVIDED:
            console.log("Please connect your wallet");
            break;
          case DomaOrderbookErrorCode.FETCH_FEES_FAILED:
            console.log("Failed to fetch marketplace fees");
            break;
          case DomaOrderbookErrorCode.CLIENT_NOT_INITIALIZED:
            console.log("SDK not initialized");
            break;
          default:
            console.log("Unknown error:", error.message);
        }
      }
    }
  }, [
    selectedDomain,
    formOffer,
    createOffer,
    address,
    callbackOnSuccess,
    setShowOfferDialog,
  ]);

  return (
    <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Send Offers</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="font-semibold">Select Domain</div>
            <div className="p-4 border-dashed border-2 rounded-lg max-h-[400px] overflow-y-auto space-y-4">
              {listDomains.length === 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  No domains found for this address.
                </div>
              )}
              {listDomains.map((domain) => (
                <div
                  key={domain.name}
                  className={cn(
                    "p-4 border rounded-lg bg-accent hover:bg-accent/50 transition-colors cursor-pointer",
                    selectedDomain?.name === domain.name &&
                      "bg-accent/50 border-dashed"
                  )}
                  onClick={() => {
                    if (selectedDomain?.name === domain.name) {
                      setSelectedDomain(null);
                    } else {
                      setSelectedDomain(domain);
                    }
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe2Icon size={16} />
                        <div className="font-semibold underline underline-offset-4">
                          {domain.name}
                        </div>
                      </div>
                      {selectedDomain?.name === domain.name && (
                        <CheckCircle2Icon className="fill-green-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon size={16} />
                      <span className="text-sm">
                        {new Date(domain.expiredAt).toLocaleDateString()}
                      </span>
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
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="font-semibold">Offer Details</div>
            <div className="p-4 border-2 border-dashed rounded-lg">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Amount</div>
                  <InputWithSelect
                    inputProps={{
                      placeholder: "Enter price",
                      value: formOffer.amount,
                      onChange: (e) =>
                        setFormOffer((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        })),
                    }}
                    selectProps={{
                      value: formOffer.currency,
                      onValueChange: (value) =>
                        setFormOffer((prev) => ({ ...prev, currency: value })),
                    }}
                    selectOptions={SUPPORTED_CURRENCIES}
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Expiration</div>
                  <Select
                    value={formOffer.expiration}
                    onValueChange={(value) =>
                      setFormOffer((prev) => ({ ...prev, expiration: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(!selectedDomain || !formOffer.amount) && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircleIcon />
                  <AlertTitle>Unable to process your offer.</AlertTitle>
                  <AlertDescription>
                    <p>Please complete below information</p>
                    <ul className="list-inside list-disc text-sm">
                      {!selectedDomain && <li>Selected Domain</li>}
                      {!formOffer.amount && <li>Offer Amount</li>}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              <Button
                className="w-full mt-4"
                onClick={handleSendOffer}
                disabled={isLoadingOffer || !selectedDomain || !formOffer.amount}
              >
                {isLoadingOffer ? "Processing..." : "Send Offer"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSendOffer;
