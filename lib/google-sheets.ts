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

export async function fetchLiveBookings(): Promise<BookingRecord[]> {
  try {
    const url = `${GOOGLE_FORM_CONFIG.CSV_URL}&t=${Date.now()}`;
    const response = await fetch(url, {
      cache: "no-store",
    });
    
    if (!response.ok) throw new Error("Failed to fetch bookings");
    
    let csvData = await response.text();
    
    // Robustly handle newlines inside quotes by replacing them with a space
    csvData = csvData.replace(/"([^"]*)"/g, (match, p1) => {
      return '"' + p1.replace(/\n/g, ' ') + '"';
    });
    
    const rows = csvData.split(/\r?\n/).filter(row => row.trim() !== "");
    if (rows.length < 2) return [];

    const headers = rows[0].split(",").map(h => h.replace(/^"|"$/g, "").trim().toLowerCase());
    
    const idx = {
      timestamp: headers.indexOf("timestamp"),
      name: headers.indexOf("name"),
      phone: headers.indexOf("phone number"),
      slot: headers.indexOf("slot"),
      txnid: headers.findIndex(h => h.includes("transaction id")),
      date: headers.findIndex(h => h.includes("date")), // Matches "date" or "booking date"
      status: headers.indexOf("status"),
    };

    const records: BookingRecord[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Split by comma but respect quotes
      const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const cleanValues = values.map(v => v.replace(/^"|"$/g, "").trim());
      
      const rawDate = cleanValues[idx.date] || "";
      let normalizedDate = "";

      if (rawDate) {
        // Attempt to parse YYYY-MM-DD first (our submission format)
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
          normalizedDate = rawDate;
        } 
        // Handle MM/DD/YYYY or DD/MM/YYYY
        else if (rawDate.includes("/")) {
          const parts = rawDate.split("/");
          if (parts.length === 3) {
            const p0 = parseInt(parts[0]);
            const p1 = parseInt(parts[1]);
            const yearPart = parts[2].split(" ")[0]; // Handle cases like "2024 12:00:00"
            
            let month, day, year = yearPart;
            if (year.length === 2) year = "20" + year;

            // Heuristic to detect DD/MM or MM/DD
            if (p0 > 12) {
              // must be DD/MM/YYYY
              day = p0.toString().padStart(2, "0");
              month = p1.toString().padStart(2, "0");
            } else if (p1 > 12) {
              // must be MM/DD/YYYY
              month = p0.toString().padStart(2, "0");
              day = p1.toString().padStart(2, "0");
            } else {
              // Ambiguous! Default to DD/MM/YYYY (likely for India site)
              // But if we feel strongly about Google default, we could swap.
              // Let's assume DD/MM/YYYY since it's the most common local format.
              day = p0.toString().padStart(2, "0");
              month = p1.toString().padStart(2, "0");
            }
            normalizedDate = `${year}-${month}-${day}`;
          }
        }
      }

      records.push({
        timestamp: cleanValues[idx.timestamp] || "",
        name: cleanValues[idx.name] || "",
        phone: cleanValues[idx.phone] || "",
        slot: cleanValues[idx.slot] || "",
        txnid: cleanValues[idx.txnid] || "",
        date: normalizedDate,
        status: idx.status !== -1 ? (cleanValues[idx.status] || "") : "",
      });
    }
    
    return records;
  } catch (error) {
    console.error("Error fetching live bookings:", error);
    return [];
  }
}
