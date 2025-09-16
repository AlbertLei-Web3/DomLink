import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Search,
  CommandIcon,
  MessageCircle,
  Clock,
  User,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearchDomains } from "@/api/query";
import { extractCAIP10 } from "@/lib/utils";
import useApp from "@/hooks/useApp";
import { SUPPORTED_CHAINS } from "@/config";
import DialogCheckingDM from "./dialog-checking-dm";

interface Web3Domain {
  domainName: string;
  owner: string;
  expired_at: Date;
  network: string;
}

export function CommandSearch() {
  const [openCheckingDm, setOpenCheckingDm] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | undefined>(
    undefined
  );
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const {
    data,
    isFetching: isLoading,
    isError,
  } = useSearchDomains(debouncedSearchValue);
  const { isLogin } = useApp();

  const listDomains = useMemo(() => {
    if (isError) return [];
    return (data || []).map((domain) => {
      const caip10 = extractCAIP10(domain.claimedBy);
      const networkName =
        SUPPORTED_CHAINS.find((chain) => chain.id === caip10?.networkId)
          ?.name || "Unknown";
      return {
        domainName: domain.name,
        owner: caip10?.accountAddress || "Unknown",
        network: networkName,
        expired_at: new Date(domain.expiresAt),
      } as Web3Domain;
    });
  }, [data, isError]);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 400); // 400ms debounce
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchValue]);

  useEffect(() => {
    if (!isLogin) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isLogin]);

  const isExpired = (date: Date) => date < new Date();

  const truncateAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleMessage = useCallback((user: string) => {
    setSelectedUser(user);
    setOpenCheckingDm(true);
    setIsOpen(false);
  }, []);

  return (
    <>
      <DialogCheckingDM
        open={openCheckingDm}
        onOpenChange={setOpenCheckingDm}
        userAddress={selectedUser}
      />
      <Button
        variant="outline"
        className="w-10 h-10 p-2 justify-center text-muted-foreground bg-transparent lg:w-full lg:justify-between lg:px-3 lg:h-auto"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden lg:inline">Search domains...</span>
        </div>
        <div className="hidden lg:flex items-center gap-1 text-xs">
          <CommandIcon className="h-3 w-3" />
          <span>K</span>
        </div>
      </Button>

      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput
          placeholder="Search domains..."
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              </div>
              <h3 className="text-lg font-medium mb-2">Searching domains...</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Looking for domains matching "{searchValue}"
              </p>
            </div>
          ) : listDomains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchValue ? "No domains found" : "No domains available"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchValue
                  ? `No domains match "${searchValue}". Try searching with a different term or domain name.`
                  : "Start by connecting your wallet or registering your first domain to see them here."}
              </p>
              {searchValue && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-transparent"
                  onClick={() => setSearchValue("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <CommandGroup heading="Domains">
              {listDomains.map((domain) => (
                <CommandItem
                  key={domain.domainName}
                  className="flex items-center justify-between p-3"
                  onSelect={() => handleMessage(domain.owner)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{domain.domainName}</span>
                        {isExpired(domain.expired_at) && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Expired
                          </span>
                        )}
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                          {domain.network || "ethereum"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{truncateAddress(domain.owner)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{domain.expired_at.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessage(domain.owner);
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
