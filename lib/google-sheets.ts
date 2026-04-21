import { GOOGLE_FORM_CONFIG } from "./constants";

export interface BookingRecord {
  timestamp: string;
  name: string;
  phone: string;
  slot: string;
  txnid: string;
  date: string;
  status: string;
}

const GAS_API_URL = process.env.NEXT_PUBLIC_GAS_API_URL;

/**
 * REWRITTEN FOR REAL-TIME "PRO SYNC" (v6 Super-Fix)
 * This version handles the UTC date shift by forcing all incoming dates 
 * into a strict YYYY-MM-DD format.
 */
export async function fetchLiveBookings(): Promise<BookingRecord[]> {
  try {
    if (!GAS_API_URL) {
      console.error("GAS_API_URL is missing in .env");
      return [];
    }

    const url = `${GAS_API_URL}?t=${Date.now()}`;
    const response = await fetch(url, { cache: "no-store", mode: "cors" });
    
    if (!response.ok) throw new Error("Failed to fetch Google Sheet data via GAS API");
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error("Unexpected data format from GAS:", data);
      return [];
    }

    const getVal = (record: any, terms: string[]) => {
      const keys = Object.keys(record);
      // More robust key matching to handle \n or spaces in sheet headers
      const key = keys.find(k => terms.some(t => k.toLowerCase().includes(t.toLowerCase())));
      let val = key ? String(record[key]).trim() : "";
      
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      return val.trim();
    };

    return data.map((record: any) => {
      // Look for Date info specifically
      const rawDate = getVal(record, ["date", "booking date", "day"]);
      const status = getVal(record, ["status"]) || "Pending";
      
      return {
        timestamp: getVal(record, ["timestamp", "time"]),
        name: getVal(record, ["name", "customer"]),
        phone: getVal(record, ["phone", "mobile", "contact"]),
        slot: getVal(record, ["slot", "time slot"]),
        txnid: getVal(record, ["transaction", "txn", "id", "ref"]),
        date: normalizeDate(rawDate),
        status: status,
      };
    }).filter(r => r.name);

  } catch (error) {
    console.error("Fetch error (GAS API):", error);
    return fetchCSVFallback();
  }
}

async function fetchCSVFallback(): Promise<BookingRecord[]> {
  try {
    const url = `${GOOGLE_FORM_CONFIG.CSV_URL}&t=${Date.now()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return [];
    
    const text = await response.text();
    const rows = text.split(/\r?\n/).map(row => {
      const parts = [];
      let current = "";
      let inQuotes = false;
      for (const char of row) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) { parts.push(current); current = ""; }
        else current += char;
      }
      parts.push(current);
      return parts;
    });

    const headers = rows[0].map(h => h.toLowerCase().trim());
    return rows.slice(1).map(row => {
      const get = (terms: string[]) => {
        const i = headers.findIndex(h => terms.some(t => h.includes(t)));
        let v = i !== -1 ? row[i]?.trim() || "" : "";
        if (v.startsWith('"') && v.endsWith('"')) v = v.substring(1, v.length-1);
        return v.trim();
      };
      return {
        timestamp: get(["timestamp"]),
        name: get(["name"]),
        phone: get(["phone"]),
        slot: get(["slot"]),
        txnid: get(["transaction", "txn"]),
        date: normalizeDate(get(["date"])),
        status: get(["status"]) || "Pending",
      };
    }).filter(r => r.name);
  } catch (e) {
    return [];
  }
}

/**
 * Strict date normalization to handle the India Time Zone offset (+5:30).
 * Prevents dates from shifting to the previous day.
 */
export function normalizeDate(raw: string): string {
  if (!raw) return "";
  const trim = raw.trim();
  
  // If it's a UTC/ISO string from JSON (e.g., 2026-04-20T18:30:00Z)
  if (trim.includes("T") && trim.endsWith("Z")) {
    const date = new Date(trim);
    // Add 5.5 hours for IST to get the correct "Sheet Date"
    date.setMinutes(date.getMinutes() + 330);
    return date.toISOString().split("T")[0];
  }

  // Standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(trim)) return trim.split("T")[0];
  
  // DD/MM/YYYY or MM/DD/YYYY
  if (trim.includes("/")) {
    const p = trim.split("/");
    if (p.length >= 3) {
      try {
        const p0 = p[0].trim().padStart(2, '0');
        const p1 = p[1].trim().padStart(2, '0');
        const p2raw = p[2].split(" ")[0].trim();
        let year = p2raw;
        if (year.length === 2) year = "20" + year;

        // Force strictly to the Indian format DD/MM/YYYY if p0 > 12
        if (p0.length === 4) return `${p0}-${p1}-${p[2].split(" ")[0].trim().padStart(2, '0')}`;
        if (parseInt(p0) > 12) return `${year}-${p1}-${p0}`;
        return `${year}-${p0}-${p1}`;
      } catch (e) {
        return trim;
      }
    }
  }
  
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  } catch (e) {}

  return trim;
}
