import { MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import { coins } from "@cosmjs/proto-signing";

export interface ClaimRewardsParams {
  delegatorAddress: string;
  validatorAddresses: string[];
}

export function createClaimRewardsMessages(params: ClaimRewardsParams) {
  const { delegatorAddress, validatorAddresses } = params;
  
  return validatorAddresses.map((validatorAddress) => ({
    typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
    value: MsgWithdrawDelegatorReward.fromPartial({
      delegatorAddress,
      validatorAddress,
    }),
  }));
}