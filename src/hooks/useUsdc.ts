import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { erc20Abi, parseEther } from "viem";

const USDC_ADDRESS = "0x2f3463756C59387D6Cd55b034100caf7ECfc757b";
const SEAPORT_SPENDER = "0x0000000000000068F116a894984e2DB1123eB395";

function useUsdc() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, SEAPORT_SPENDER] : undefined,
  });

  const {
    writeContractAsync,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract();

  // Approve function: amount should be a bigint (e.g., 1 USDC = 1_000_000n)
  const approve = async () => {
    if (!address) throw new Error("Wallet not connected");
    // Max uint256 value for unlimited approval
    const MAX_UINT256 = 2n ** 256n - 1n;
    return writeContractAsync({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [SEAPORT_SPENDER, MAX_UINT256],
    });
  };

  return {
    hasAllowance: data && data > parseEther("10000000"),
    isLoading,
    error,
    refetch,
    approve,
    isApproving,
    approveError,
  };
}

export default useUsdc;
