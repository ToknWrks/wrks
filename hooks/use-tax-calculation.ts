"use client";

import { useState, useEffect } from 'react';

export function useTaxCalculation() {
  const [taxRate, setTaxRate] = useState(30); // Default tax rate

  useEffect(() => {
    // Load initial settings
    const savedSettings = localStorage.getItem("osmosis_dashboard_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setTaxRate(Number(settings.taxRate));
    }

    // Listen for settings changes
    const handleSettingsChange = (event: CustomEvent<{ taxRate: string }>) => {
      setTaxRate(Number(event.detail.taxRate));
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);

    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  const calculateTaxObligation = (usdValue: string | number): number => {
    const numericValue = typeof usdValue === 'string' 
      ? Number(usdValue.replace(/[^0-9.-]+/g, ""))
      : usdValue;
    return (numericValue * taxRate) / 100;
  };

  return {
    taxRate,
    calculateTaxObligation
  };
}