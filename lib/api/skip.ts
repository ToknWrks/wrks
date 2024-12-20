import axios from "axios";

const SKIP_API_URL = "https://api.skip.money/v2";

export const skipApi = {
  async getTransactions(params: {
    chainName: string;
    address: string;
    type: string;
    limit?: number;
  }) {
    const { chainName, address, type, limit = 100 } = params;
    return axios.get(`${SKIP_API_URL}/cosmos/${chainName}/txs`, {
      params: { address, type, limit }
    });
  },

  async getHistoricalPrice(params: {
    chainName: string;
    timestamp: string;
    denom: string;
  }) {
    const { chainName, timestamp, denom } = params;
    return axios.get(`${SKIP_API_URL}/cosmos/${chainName}/price`, {
      params: { timestamp, denom }
    });
  }
};