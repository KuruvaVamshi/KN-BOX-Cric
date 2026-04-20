export type SlotStatus = "available" | "booked" | "pending" | "expired";

export interface Slot {
  id: string;
  time: string;
  status: SlotStatus;
}

export interface BookingData {
  name: string;
  phone: string;
  slot: string;
  txnid: string;
  date: string;
}

export interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  todaySlots: number;
}
