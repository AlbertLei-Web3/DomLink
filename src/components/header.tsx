import {
  Check,
  Copy,
  GithubIcon,
  GlobeIcon,
  LogOut,
  MoonIcon,
  SunIcon,
  User,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { CommandSearch } from "./command-search";
import { Button } from "./ui/button";
import Avatar from "boring-avatars";
import { useTheme } from "./theme-provider";
import { DEFAULT_COLORS_BORING_AVATAR } from "@/config";
import { useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAccount, useDisconnect } from "wagmi";
import { shortenAddress } from "@/lib/utils";
import { useCallback } from "react";
import useApp from "@/hooks/useApp";
import useCopyClipboard from "@/hooks/useCopyClipboard";

const ToggleTheme = () => {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() =>
        setTheme(
          document.documentElement.classList.contains("dark") ? "light" : "dark"
        )
      }
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { copied, handleCopyClipboard } = useCopyClipboard();
  const { setSelectedProfile, setIsOpenProfile } = useApp();
  const { disconnect } = useDisconnect();

  const handleCopyAddress = useCallback(async () => {
    handleCopyClipboard(address || "");
  }, [address, handleCopyClipboard]);

  const handleViewProfile = useCallback(() => {
    setSelectedProfile(address);
    setIsOpenProfile(true);
  }, [address, setSelectedProfile, setIsOpenProfile]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return (
    <div className="px-4 py-2 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <GlobeIcon size={16} />
            <div>domainLine</div>
          </div>
          <Separator orientation="vertical" className="min-h-4 min-w-0.5" />
          <CommandSearch />
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/akbaridria/domainline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="icon" variant="ghost">
              <GithubIcon />
            </Button>
          </a>
          <ToggleTheme />
          <Separator orientation="vertical" className="min-h-4 min-w-0.5" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <Avatar
                  name="asd"
                  colors={DEFAULT_COLORS_BORING_AVATAR}
                  variant="beam"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56" align="end">
              <div className="flex items-center justify-between px-2 py-1.5 text-sm">
                <div>
                  <div>Wallet address</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {shortenAddress(address || "", 6, 4)}
                  </div>
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
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleViewProfile}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                View profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDisconnect}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;
