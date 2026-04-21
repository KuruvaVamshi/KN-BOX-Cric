import { SITE_CONFIG } from "./constants";

/**
 * Returns the price for a specific slot ID.
 * IDs 1-12: Day (₹250)
 * IDs 13-16: Night (₹300 - 7 PM onwards)
 */
export function getSlotPrice(slotId: string): number {
  const id = parseInt(slotId);
  if (id >= 13) return SITE_CONFIG.nightPrice;
  return SITE_CONFIG.dayPrice;
}

/**
 * Returns the price for a slot string like "7 PM - 8 PM"
 * High fallback safety if ID is not available.
 */
export function getPriceByTime(timeStr: string): number {
  if (timeStr.toLowerCase().includes("pm")) {
    const hour = parseInt(timeStr);
    // 7 PM onwards are night prices
    if (hour >= 7 && hour < 12) return SITE_CONFIG.nightPrice;
  }
  return SITE_CONFIG.dayPrice;
}
