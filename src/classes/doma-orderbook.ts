import {
  ApiClient,
  DomaOrderbookError,
  DomaOrderbookErrorCode,
  type AcceptOfferParams,
  type AcceptOfferResult,
  type Caip2ChainId,
  type CreateListingParams,
  type CreateOfferParams,
  type CreateOfferResult,
  type DomaOrderbookSDKConfig,
  type GetOrderbookFeeRequest,
  type GetOrderbookFeeResponse,
  type GetSupportedCurrenciesRequest,
  type GetSupportedCurrenciesResponse,
  type OnProgressCallback,
  type OrderbookFee,
} from "@doma-protocol/orderbook-sdk";
import { JsonRpcSigner } from "ethers";
import { CreateOfferHandler } from "./doma-create-offer";
import { SUPPORTED_CURRENCIES } from "@/config";
import { AcceptOfferHandler } from "./doma-accept-offer";

export class DomaOrderbookSDK {
  public readonly config: DomaOrderbookSDKConfig;
  private readonly apiClient: ApiClient;

  public constructor(config: DomaOrderbookSDKConfig) {
    this.config = config;
    this.apiClient = new ApiClient(config.apiClientOptions);
  }

  private validateSignerAndChainProvided(
    signer: JsonRpcSigner,
    chainId: Caip2ChainId
  ) {
    if (!signer) {
      throw new DomaOrderbookError(
        DomaOrderbookErrorCode.SIGNER_NOT_PROVIDED,
        "Signer must be provided"
      );
    }

    if (!chainId) {
      throw new DomaOrderbookError(
        DomaOrderbookErrorCode.INVALID_PARAMETERS,
        "Chain ID must be provided"
      );
    }
  }

  private async fetchFeesIfNeeded(
    params: CreateListingParams | CreateOfferParams,
    chainId: Caip2ChainId
  ): Promise<OrderbookFee[]> {
    // if provided just return
    if (params.marketplaceFees) {
      return params.marketplaceFees;
    }

    const feeRequest = {
      // 为避免大小写导致的 400 错误，这里将合约地址统一转为小写。
      // EN: Normalize contract address to lowercase to avoid 400 errors.
      contractAddress: params.items[0].contract.toLowerCase(),
      chainId: chainId,
      orderbook: params.orderbook,
    };

    try {
      const feeResponse = await this.getOrderbookFee(feeRequest);

      return params.marketplaceFees || feeResponse.marketplaceFees || [];
    } catch (error) {
      // 容错：若后端因参数问题返回 400，则回退为空费用，避免阻断出价流程。
      // Fallback: if backend responds 400, return empty fees to keep flow running.
      const maybeStatus = (error as unknown as { response?: { status?: number } })?.response?.status;
      if (maybeStatus === 400) {
        return [];
      }
      throw DomaOrderbookError.fromError(
        error,
        DomaOrderbookErrorCode.FETCH_FEES_FAILED,
        {
          chainId,
          params,
        }
      );
    }
  }

  public async createOffer({
    params,
    signer,
    chainId,
    onProgress,
  }: {
    params: CreateOfferParams;
    signer: JsonRpcSigner;
    chainId: Caip2ChainId;
    onProgress: OnProgressCallback;
  }): Promise<CreateOfferResult> {
    this.validateSignerAndChainProvided(signer, chainId);

    // Fetch fees if needed
    const marketplaceFees = await this.fetchFeesIfNeeded(params, chainId);
    const paramsWithFee = {
      ...params,
      marketplaceFees,
    };

    // Check if any item uses WETH as payment token
    const hasWethOffer =
      SUPPORTED_CURRENCIES?.find((c) => c.label === "WETH")?.value ===
      params?.items?.[0]?.currencyContractAddress;
    const handler = new CreateOfferHandler(
      this.config,
      this.apiClient,
      signer,
      chainId,
      onProgress,
      {
        seaportBalanceAndApprovalChecksOnOrderCreation: !hasWethOffer, // Skip only for WETH offers
      }
    );

    return handler.execute(paramsWithFee);
  }

  public async acceptOffer({
    params,
    signer,
    chainId,
    onProgress,
  }: {
    params: AcceptOfferParams;
    signer: JsonRpcSigner;
    chainId: Caip2ChainId;
    onProgress: OnProgressCallback;
  }): Promise<AcceptOfferResult> {
    this.validateSignerAndChainProvided(signer, chainId);

    const handler = new AcceptOfferHandler(
      this.config,
      this.apiClient,
      signer,
      chainId,
      onProgress
    );

    return handler.execute(params);
  }

  public async getOrderbookFee(
    params: GetOrderbookFeeRequest
  ): Promise<GetOrderbookFeeResponse> {
    return this.apiClient.getOrderbookFee(params);
  }

  public async getSupportedCurrencies(
    params: GetSupportedCurrenciesRequest
  ): Promise<GetSupportedCurrenciesResponse> {
    return this.apiClient.getSupportedCurrencies(params);
  }
}

let client: DomaOrderbookSDK | null = null;

export const createDomaOrderbookClient = (
  config: DomaOrderbookSDKConfig
): DomaOrderbookSDK => {
  client = new DomaOrderbookSDK(config);
  return client;
};

export const getDomaOrderbookClient = (): DomaOrderbookSDK => {
  if (!client) {
    throw new DomaOrderbookError(
      DomaOrderbookErrorCode.CLIENT_NOT_INITIALIZED,
      "DomaOrderbookClient not initialized. Call createDomaOrderbookClient first."
    );
  }

  return client;
};
