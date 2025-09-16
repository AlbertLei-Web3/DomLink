import { useCallback } from "react";
import { useState } from "react";

const useCopyClipboard = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  }, []);

  return { copied, handleCopyClipboard };
};

export default useCopyClipboard;
