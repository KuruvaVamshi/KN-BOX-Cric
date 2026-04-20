export interface BookingNotificationData {
  name: string;
  phone: string;
  slot: string;
  date: string;
  txnid: string;
}

export async function sendBookingAlerts(data: BookingNotificationData) {
  const numbersStr = process.env.WHATSAPP_NUMBERS || "";
  const keysStr = process.env.WHATSAPP_KEYS || "";

  const numbers = numbersStr.split(",").map(n => n.trim());
  const keys = keysStr.split(",").map(k => k.trim());

  if (numbers.length === 0 || keys.length === 0) {
    console.warn("WhatsApp notifications not configured correctly in .env");
    return;
  }

  const message = `🏏 *NEW BOOKING ALERT* 🏏\n\n` +
                  `👤 *Name:* ${data.name}\n` +
                  `📞 *Phone:* ${data.phone}\n` +
                  `📅 *Date:* ${data.date}\n` +
                  `⏳ *Slots:* ${data.slot}\n` +
                  `🆔 *Txn ID:* ${data.txnid}\n\n` +
                  `_Check Admin Panel for details._`;

  const encodedMessage = encodeURIComponent(message);

  // Send to all configured recipients
  const promises = numbers.map((number, index) => {
    const apiKey = keys[index];
    if (!apiKey || apiKey.startsWith("REPLACE_WITH")) return Promise.resolve();

    const url = `https://api.callmebot.com/whatsapp.php?phone=${number}&text=${encodedMessage}&apikey=${apiKey}`;
    
    return fetch(url, { method: "GET", mode: "no-cors" })
      .then(() => console.log(`Notification sent to ${number}`))
      .catch(err => console.error(`Failed to send notification to ${number}:`, err));
  });

  await Promise.allSettled(promises);
}
