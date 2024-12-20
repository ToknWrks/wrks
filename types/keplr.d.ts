interface Window {
  keplr?: {
    enable: (chainId: string) => Promise<void>;
    getOfflineSigner: (chainId: string) => import("@cosmjs/proto-signing").OfflineSigner;
    getKey: (chainId: string) => Promise<{
      name: string;
      algo: string;
      pubKey: Uint8Array;
      address: Uint8Array;
      bech32Address: string;
    }>;
    disable: (chainId: string) => Promise<void>;
  };
  addEventListener(type: 'keplr_keystorechange', listener: () => void): void;
  removeEventListener(type: 'keplr_keystorechange', listener: () => void): void;
}