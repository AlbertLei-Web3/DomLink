import {
  DomaOrderbookError,
  DomaOrderbookErrorCode,
  prepareActionSteps,
  Progress,
  type BlockchainActions,
  type OfferItem,
  type ProgressStep,
} from "@doma-protocol/orderbook-sdk";
import { ItemType } from "@opensea/seaport-js/lib/constants";
import type {
  ApprovalAction,
  ConsiderationInputItem,
  CreateOrderInput,
  CurrencyItem,
  Fee,
} from "@opensea/seaport-js/lib/types";

export const executeAllActions = async <R>(
  actions: ReadonlyArray<BlockchainActions>,
  options?: {
    onProgress?: (progress: ProgressStep[]) => void;
  }
): Promise<R> => {
  const { onProgress } = options || {};

  if (!actions?.length) {
    throw new DomaOrderbookError(
      DomaOrderbookErrorCode.INVALID_PARAMETERS,
      "No actions provided"
    );
  }

  const preparedSteps = prepareActionSteps(actions);
  const progress = new Progress(preparedSteps, onProgress);
  let finalResult: R | null = null;

  // Process all actions
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const isFinalAction = i === actions.length - 1;

    progress.updateStep(i, { progressState: "pending" });

    try {
      // signature-based actions
      if (action.type === "create") {
        const createResult = await action.createOrder();
        progress.completeStep(i);

        if (isFinalAction) {
          finalResult = createResult as R;
        }
      } else if (action.type === "createBulk") {
        const bulkResult = await action.createBulkOrders();
        progress.completeStep(i);

        if (isFinalAction) {
          finalResult = bulkResult as R;
        }
      } else if (action.type === "offChainCancel") {
        const cancelResult = await action.createCancelSignature();
        progress.completeStep(i);

        if (isFinalAction) {
          finalResult = cancelResult as R;
        }
      }
      // transaction-based actions
      else {
        const tx = await action.transactionMethods.transact();

        if (tx) {
          progress.setTransactionSubmitted(i, tx.hash, Number(tx.chainId));
        }

        const txResult = await tx.wait();
        progress.completeStep(i);

        if (isFinalAction) {
          finalResult = txResult as R;
        }
      }
    } catch (error) {
      progress.failStep(i, error);

      const actionType = action.type;
      const errorContext = {
        actionType,
        actionIndex: i,
        progress: progress.items,
      };

      if (actionType === "approval") {
        throw new DomaOrderbookError(
          DomaOrderbookErrorCode.SEAPORT_APPROVAL_FAILED,
          `Failed to approve ${(action as ApprovalAction).token || "token"}`,
          error,
          errorContext
        );
      }

      if (actionType === "create" || actionType === "createBulk") {
        throw new DomaOrderbookError(
          DomaOrderbookErrorCode.SEAPORT_SIGNATURE_FAILED,
          `Failed to ${actionType}`,
          error,
          errorContext
        );
      }

      if (actionType === "offChainCancel") {
        throw new DomaOrderbookError(
          DomaOrderbookErrorCode.OFFCHAIN_CANCEL_ORDER_FAILED,
          `Failed to ${actionType}`,
          error,
          errorContext
        );
      }

      if (actionType === "exchange" || actionType === "cancelOrder") {
        throw new DomaOrderbookError(
          DomaOrderbookErrorCode.SEAPORT_TRANSACTION_FAILED,
          `Failed to ${actionType}`,
          error,
          errorContext
        );
      }

      if (actionType === "conversion") {
        throw new DomaOrderbookError(
          DomaOrderbookErrorCode.TOKEN_CONVERSION_FAILED,
          `Failed to ${actionType}`,
          error,
          errorContext
        );
      }

      throw new DomaOrderbookError(
        DomaOrderbookErrorCode.UNKNOWN_ERROR,
        `Failed to execute ${actionType}`,
        error,
        errorContext
      );
    }
  }

  if (!finalResult) {
    throw new DomaOrderbookError(
      DomaOrderbookErrorCode.UNKNOWN_ERROR,
      "Final result not found",
      null,
      {
        progress: progress.items,
      }
    );
  }

  return finalResult;
};

export function buildOfferOrderInput(
  item: OfferItem,
  buyerAddress: string,
  endTime: number,
  fees: Fee[]
): CreateOrderInput {
  const offerer = buyerAddress;

  const offerItems: CurrencyItem[] = [
    {
      token: item.currencyContractAddress,
      amount: item.price,
    },
  ];

  const considerationItems: ConsiderationInputItem[] = [];
  if (item.itemType === ItemType.ERC1155) {
    considerationItems.push({
      itemType: ItemType.ERC1155,
      token: item.contract,
      identifier: item.tokenId,
      amount: "1",
      recipient: offerer,
    });
  } else {
    considerationItems.push({
      itemType: ItemType.ERC721,
      token: item.contract,
      identifier: item.tokenId,
      recipient: offerer,
    });
  }

  return {
    offerer,
    endTime: endTime.toString(),
    offer: offerItems,
    consideration: considerationItems,
    allowPartialFills: false,
    restrictedByZone: true,
    fees,
    zone: "0xCEF2071b4246DB4D0E076A377348339f31a07dEA",
  } as CreateOrderInput;
}
