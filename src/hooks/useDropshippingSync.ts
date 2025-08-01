import { useEffect, useRef } from 'react';
import { dropshippingService } from '../services/dropshippingService';

export const useDropshippingSync = (intervalMinutes: number = 60) => {
  const intervalRef = useRef<NodeJS.Timeout>();

  const syncInventory = async () => {
    try {
      const response = await dropshippingService.syncInventory();
      console.log('Inventory sync completed:', response);
    } catch (error) {
      console.error('Inventory sync failed:', error);
    }
  };

  useEffect(() => {
    // Initial sync
    syncInventory();

    // Set up interval for periodic sync
    intervalRef.current = setInterval(syncInventory, intervalMinutes * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMinutes]);

  return { syncInventory };
};