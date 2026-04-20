export const SITE_CONFIG = {
  name: "KN BOX",
  tagline: "The Ultimate Turf Experience",
  advanceAmount: 250,
  pricing: 500, // Normalized to number
  payment: {
    upiId: "vamshikrishna9133@ybl", // Example UPI ID
    vpaName: "VAMSHI KRISHNA",
  },
  contact: {
    phone: "+91 9392454506, 7569521993",
    whatsapp: "919392454506",
  },
};

export const GOOGLE_FORM_CONFIG = {
  CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRaADJ0JKgkNQOL40qSkcNNgW51QQlMDN6b-TeqACdKRsbeNBN0uknaUh6viEIlrmMmtWEAQR3F6trG/pub?output=csv",
  FORM_URL: "https://docs.google.com/forms/d/10bCzAGWRd2QC8cZXFGAXS-dKHKCmh5PdkQQ7T9k2IOY/formResponse",
  entries: {
    name: "entry.756876511",
    phone: "entry.2058697394",
    slot: "entry.256346460",
    txnid: "entry.737729316",
    date: "entry.2102160460",
  },
};

export const SLOTS_DATA = [
  { id: "1", time: "7 AM - 8 AM", status: "available" },
  { id: "2", time: "8 AM - 9 AM", status: "available" },
  { id: "3", time: "9 AM - 10 AM", status: "available" },
  { id: "4", time: "10 AM - 11 AM", status: "available" },
  { id: "5", time: "11 AM - 12 PM", status: "available" },
  { id: "6", time: "12 PM - 1 PM", status: "available" },
  { id: "7", time: "1 PM - 2 PM", status: "available" },
  { id: "8", time: "2 PM - 3 PM", status: "available" },
  { id: "9", time: "3 PM - 4 PM", status: "available" },
  { id: "10", time: "4 PM - 5 PM", status: "available" },
  { id: "11", time: "5 PM - 6 PM", status: "available" },
  { id: "12", time: "6 PM - 7 PM", status: "available" },
  { id: "13", time: "7 PM - 8 PM", status: "available" },
  { id: "14", time: "8 PM - 9 PM", status: "available" },
  { id: "15", time: "9 PM - 10 PM", status: "available" },
  { id: "16", time: "10 PM - 11 PM", status: "available" },
] as const;
