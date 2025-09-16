import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractCAIP10(
  input: string
): { accountId: string; networkId: number; accountAddress: string } | null {
  const parts = input.split(":");
  if (parts.length === 3) {
    const [accountId, networkIdStr, accountAddress] = parts;
    const networkId = Number(networkIdStr);
    if (isNaN(networkId)) return null;
    return { accountId, networkId, accountAddress };
  }
  return null;
}

export function shortenAddress(
  address: string,
  suffixSlice: number = 8,
  prefixSlice: number = 10
): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, prefixSlice)}...${address.slice(-suffixSlice)}`;
}

