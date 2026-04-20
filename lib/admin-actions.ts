import { GOOGLE_FORM_CONFIG } from "./constants";

const GAS_API_URL = process.env.NEXT_PUBLIC_GAS_API_URL;

export async function updateBookingStatus(txnid: string, phone: string, status: "Confirmed" | "Rejected") {
  if (!GAS_API_URL) {
    console.error("GAS_API_URL not set in .env");
    throw new Error("Backend API not configured");
  }

  try {
    const response = await fetch(GAS_API_URL, {
      method: "POST",
      mode: "no-cors", // Necessary for Google Apps Script Web Apps if not handled by CORS
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "updateStatus",
        txnid,
        phone,
        status,
      }),
    });

    // Note: With no-cors, we can't read the response body, 
    // but the request will still reach the server.
    return true;
  } catch (error) {
    console.error("Failed to update status:", error);
    throw error;
  }
}

export async function addManualBooking(data: {
  name: string;
  phone: string;
  slot: string;
  date: string;
  txnid?: string;
}) {
  try {
    const gFormUrl = GOOGLE_FORM_CONFIG.FORM_URL;
    const params = new URLSearchParams();
    params.append(GOOGLE_FORM_CONFIG.entries.name, data.name);
    params.append(GOOGLE_FORM_CONFIG.entries.phone, data.phone);
    params.append(GOOGLE_FORM_CONFIG.entries.slot, data.slot);
    params.append(GOOGLE_FORM_CONFIG.entries.txnid, data.txnid || `MANUAL-${Date.now().toString().slice(-6)}`);
    params.append(GOOGLE_FORM_CONFIG.entries.date, data.date);

    await fetch(gFormUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    return true;
  } catch (error) {
    console.error("Failed to add manual booking:", error);
    throw error;
  }
}
