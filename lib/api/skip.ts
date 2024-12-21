import axios from 'axios';
import { SUPPORTED_CHAINS } from '@/lib/constants/chains';
import { logError } from '@/lib/error-handling';

const SKIP_API_URL = "https://api.skip.money/v2";

// Fee configuration with small fee
const FEE_CONFIG = {
  amount: "2500", // 0.0025 OSMO
  denom: "uosmo",
  gas: "200000"
};

export async function getClaimRoute(params: {
  address: string;
  validatorAddresses: string[];
  sourceChainId: string;
}) {
  try {
    const { address, validatorAddresses, sourceChainId } = params;

    // Create claim messages
    const messages = validatorAddresses.map(validatorAddress => ({
      type: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
      value: {
        delegator_address: address,
        validator_address: validatorAddress
      }
    }));

    // Get route from Skip API
    const response = await axios.post(`${SKIP_API_URL}/fungible/route`, {
      messages,
      source_asset_chain_id: sourceChainId,
      source_asset_denom: FEE_CONFIG.denom,
      address,
      client_id: "toknwrks",
      slippage_tolerance_percent: "1.0",
      fee_amount: FEE_CONFIG.amount,
      gas_limit: FEE_CONFIG.gas
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (err) {
    throw new Error(logError(err, 'Getting claim route'));
  }
}