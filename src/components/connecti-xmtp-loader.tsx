import { Loader } from "lucide-react";

const ConnectXMTPLoader = () => {
  return (
    <div className="absolute z-[10] top-0 left-0 w-full h-full bg-background/50 pointer-events-auto transition-opacity backdrop-blur-xs">
      <div className="flex items-center justify-center h-full gap-2">
        <Loader size={16} className="animate-spin" />
        <div className="text-sm">Connecting to XMTP...</div>
      </div>
    </div>
  );
};

export default ConnectXMTPLoader;
