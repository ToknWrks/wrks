import { SigningStargateClient } from "@cosmjs/stargate";
import { SUPPORTED_CHAINS } from "@/lib/constants/chains";
import { createClaimRewardsMessages } from "@/lib/messages/claim-rewards";

export async function claimChainRewards({
  chainName,
  address,
  validatorAddresses,
  client
}: {
  chainName: string;
  address: string;
  validatorAddresses: string[];
  client: SigningStargateClient;
}) {
  const chain = SUPPORTED_CHAINS[chainName as keyof typeof SUPPORTED_CHAINS];
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainName}`);
  }

  const messages = createClaimRewardsMessages({
    delegatorAddress: address,
    validatorAddresses
  });

  const tx = await client.signAndBroadcast(
    address,
    messages,
    {
      amount: [{ amount: "5000", denom: chain.denom }],
      gas: "200000",
    }
  );

  if (tx.code !== 0) {
    throw new Error(tx.rawLog || 'Failed to claim rewards');
  }

  return tx;
}