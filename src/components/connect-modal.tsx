import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useModal } from "connectkit";
import { useAccount } from "wagmi";
import { Loader2, Wallet } from "lucide-react";

const ConnectModal = () => {
  const [open, onOpenChange] = useState(false);
  const { open: openModalWallet, setOpen: setOpenModalWallet } = useModal();
  const { isConnecting, address } = useAccount();

  useEffect(() => {
    if (!address) {
      onOpenChange(true);
    } else {
      onOpenChange(false);
    }
  }, [address]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-balance">
            Welcome to{" "}
            <span className="text-primary underline underline-offset-4">
              domainLine
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Connect Your Wallet</CardTitle>
              <CardDescription className="text-pretty">
                Connect your Web3 wallet to start negotiating domain deals
                securely on the blockchain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setOpenModalWallet(true)}
                disabled={isConnecting && openModalWallet}
                className="w-full"
                size="lg"
              >
                {isConnecting && openModalWallet ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectModal;
