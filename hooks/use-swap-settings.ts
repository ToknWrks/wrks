"use client";

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'osmosis_dashboard_settings';

interface Settings {
  autoSwapPercentage: string;
  taxRate: string;
  selectedToken: string;
}

export function useSwapSettings() {
  const [settings, setSettings] = useState<Settings>({
    autoSwapPercentage: "50",
    taxRate: "30",
    selectedToken: "noble-usdc"
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (err) {
        console.error('Error parsing settings:', err);
      }
    }
  }, []);

  return {
    settings,
    autoSwapPercentage: Number(settings.autoSwapPercentage),
    selectedToken: settings.selectedToken
  };
}