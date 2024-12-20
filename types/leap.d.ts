interface Window {
  LeapElements?: {
    mountElements: (config: {
      connectWallet: () => void;
      connectedWalletType?: string;
      isTestnet: boolean;
      element: {
        name: string;
        props: {
          allowedSourceChains: {
            chainTypes: string[];
          };
        };
      };
      enableSmartSwap: boolean;
      skipClientId: string;
      leapIntegratorId: string;
      elementsRoot: string;
    }) => void;
    WalletType: {
      LEAP: string;
    };
  };
}