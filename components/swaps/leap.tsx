import { useEffect, useMemo, useRef, useState } from 'react';
import '@leapwallet/elements'; // Load Leap Elements definitions

const Swaps = () => {
  const [isElementsReady, setIsElementsReady] = useState(false);
  const isElementsMounted = useRef(false);

  const connectWallet = () => {
    console.log("Trigger your dApp's connect wallet flow");
  };

  const connectedWalletType = useMemo(() => {
    if (typeof window === 'undefined' || !window.LeapElements) {
      return undefined;
    }
    return window.LeapElements.WalletType.LEAP;
  }, []);

  useEffect(() => {
    if (isElementsReady && !isElementsMounted.current) {
      isElementsMounted.current = true;
      window.LeapElements?.mountElements?.({
        connectWallet,
        connectedWalletType,
        isTestnet: false,
        element: {
          name: 'aggregated-swaps',
          props: {
            allowedSourceChains: {
              chainTypes: ['cosmos', 'evm', 'svm'],
            },
          },
        },
        enableSmartSwap: true,
        skipClientId: 'your-client-id', // Replace with your actual client ID
        leapIntegratorId: 'your-integrator-id', // Replace with your actual integrator ID
        elementsRoot: '#leap-elements-container', // ID of the container
      });
    }
  }, [connectWallet, connectedWalletType, isElementsReady]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.LeapElements) {
      setIsElementsReady(true);
      return;
    }

    const handleLoad = () => setIsElementsReady(true);

    window.addEventListener('@leapwallet/elements:load', handleLoad);

    return () => {
      window.removeEventListener('@leapwallet/elements:load', handleLoad);
    };
  }, []);

  return isElementsReady ? (
    <div
      id="leap-elements-container"
      className="leap-ui dark h-full w-full rounded-xl"
    />
  ) : (
    <p>Loading...</p>
  );
};

export default Swaps;
