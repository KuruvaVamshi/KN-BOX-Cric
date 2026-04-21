"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, Loader2, IndianRupee, PartyPopper, Phone, User, Hash, MessageCircle } from "lucide-react";
import { Slot, BookingData } from "@/types";
import { SITE_CONFIG, GOOGLE_FORM_CONFIG } from "@/lib/constants";
import { toast } from "sonner";
import Image from "next/image";
import { sendBookingAlerts } from "@/lib/notifications";
import Swal from "sweetalert2";

interface BookingModalProps {
  slots: Slot[];
  onClose: () => void;
  onSuccess: (bookedSlots: Slot[]) => void;
  selectedDate: Date;
}

export default function BookingModal({ slots, onClose, onSuccess, selectedDate }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const slotText = slots.map(s => s.time).join(", ");
  const totalAdvance = slots.length * SITE_CONFIG.advanceAmount;

  const [formData, setFormData] = useState<BookingData>({
    name: "",
    phone: "",
    slot: slotText,
    txnid: "",
    date: selectedDate.toLocaleDateString(),
  });

  if (slots.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.txnid) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill in all details',
        confirmButtonColor: '#22c55e',
      });
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Phone',
        text: 'Please enter a valid 10-digit phone number',
        confirmButtonColor: '#22c55e',
      });
      return;
    }

    setLoading(true);

    try {
      const gFormUrl = GOOGLE_FORM_CONFIG.FORM_URL;
      const params = new URLSearchParams();
      params.append(GOOGLE_FORM_CONFIG.entries.name, formData.name);
      params.append(GOOGLE_FORM_CONFIG.entries.phone, formData.phone);
      params.append(GOOGLE_FORM_CONFIG.entries.slot, slotText);
      params.append(GOOGLE_FORM_CONFIG.entries.txnid, formData.txnid);
      
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      params.append(GOOGLE_FORM_CONFIG.entries.date, formattedDate);

      await fetch(gFormUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      // Send WhatsApp Notifications to Admins
      try {
        await sendBookingAlerts({
          name: formData.name,
          phone: formData.phone,
          slot: slotText,
          date: formattedDate,
          txnid: formData.txnid,
        });
      } catch (notifyError) {
        console.error("Notification failed:", notifyError);
      }

      const whatsappMsg = `Hi Admin, I'm ${formData.name}. I've just booked the slots: ${slotText} for ${formattedDate}. Please accept my booking!`;
      const encodedMsg = encodeURIComponent(whatsappMsg);
      const admin1Url = `https://wa.me/919392454506?text=${encodedMsg}`;
      const admin2Url = `https://wa.me/917569521993?text=${encodedMsg}`;

      Swal.fire({
        title: 'Booking Request Sent!',
        html: `
          <div class="text-zinc-400 space-y-4 pt-2">
            <p>Your request for <b class="text-white">${slotText}</b> on <b class="text-white">${formattedDate}</b> has been received.</p>
            <p class="text-sm">Click below to notify admins to <b class="text-cricket-green">Accept your booking</b>:</p>
            <div class="grid grid-cols-1 gap-3 pt-2">
              <a href="${admin1Url}" target="_blank" class="flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-4 px-4 rounded-2xl transition-all no-underline shadow-[0_10px_20px_rgba(34,197,94,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Notify Admin 1 (Primary)
              </a>
              <a href="${admin2Url}" target="_blank" class="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 px-4 rounded-2xl transition-all no-underline border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Notify Admin 2
              </a>
            </div>
          </div>
        `,
        icon: 'success',
        showConfirmButton: true,
        confirmButtonText: 'Done',
        confirmButtonColor: '#22c55e',
        background: '#121212',
        color: '#fff',
        customClass: {
          popup: 'rounded-[3rem] border border-white/10 shadow-2xl p-8',
          title: 'text-3xl font-black tracking-tighter uppercase',
          confirmButton: 'w-full rounded-2xl font-black uppercase tracking-widest text-[10px] py-4 mt-4 shadow-lg'
        }
      });

      setIsSuccess(true);
      onSuccess(slots);
      
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Something went wrong. Please try again or contact support.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop - Explicitly handle click to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh] no-scrollbar"
      >
        {isSuccess ? (
          <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="h-24 w-24 bg-cricket-green rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.4)] relative">
               <CheckCircle2 className="h-12 w-12 text-white" />
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute inset-0 rounded-full border-4 border-cricket-green"
               />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center justify-center gap-3">
                REQUEST SENT <PartyPopper className="h-8 w-8 text-cricket-green" />
              </h2>
              
              <div className="bg-cricket-green/10 border border-cricket-green/20 rounded-3xl p-6 space-y-4 max-w-sm mx-auto">
                 <p className="text-white font-bold text-sm uppercase tracking-widest">⚠️ Action Required ⚠️</p>
                 <p className="text-zinc-300 text-sm leading-relaxed">
                   To finalize your booking, please **Call** or **WhatsApp** us now with your **Payment Screenshot**.
                 </p>
                 
                 <div className="space-y-3 pt-2">
                    {[
                      { number: "9392454506", label: "Admin 1 (Primary)" },
                      { number: "7569521993", label: "Admin 2" }
                    ].map((contact, i) => (
                      <div key={i} className="flex flex-col gap-3 bg-black/40 p-5 rounded-[2rem] border border-white/5">
                        <div className="flex items-center justify-between px-2">
                          <div className="text-left">
                            <p className="text-[10px] font-black text-zinc-500 uppercase leading-none mb-1">{contact.label}</p>
                            <p className="text-white font-bold text-sm tracking-tight">{contact.number}</p>
                          </div>
                          <a 
                            href={`tel:+91${contact.number}`}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                            title="Call Now"
                          >
                            <Phone className="h-4 w-4 text-cricket-green" />
                          </a>
                        </div>
                        
                        <a 
                          href={`https://wa.me/91${contact.number}?text=${encodeURIComponent(`Hi, I'm ${formData.name}. I just booked slots (${slotText}) for ${formData.date} at KN BOX. My Txn ID is ${formData.txnid}. Here is my payment screenshot.`)}`}
                          target="_blank"
                          className="w-full bg-cricket-green/20 hover:bg-cricket-green text-cricket-green hover:text-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px]"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Send Screenshot via WhatsApp</span>
                        </a>
                      </div>
                    ))}
                 </div>
              </div>

              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-relaxed pt-4">
                Your slots are currently <span className="text-yellow-500">Pending Approval</span>.<br />
                We verify and confirm within 15 minutes!
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-white text-black hover:bg-cricket-green hover:text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Back to Schedule
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Elegant Header */}
            <div className="bg-white/5 p-8 flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter flex items-center gap-2 leading-none uppercase">
                   Booking <span className="text-cricket-green">Summary</span>
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded-lg">
                     📅 {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-cricket-green/20 text-cricket-green rounded-lg border border-cricket-green/30">
                     ⏳ {slots.length} Hour{slots.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-12 w-12 bg-white/5 hover:bg-red-500/20 hover:text-red-500 border border-white/5 rounded-2xl flex items-center justify-center transition-all group"
              >
                <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Payment Card */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-cricket-green mb-1">
                      <div className="h-5 w-5 bg-cricket-green rounded-full flex items-center justify-center text-black font-black text-[10px]">1</div>
                      <h3 className="text-xs font-black uppercase tracking-widest">Pay Advance Payment</h3>
                   </div>
                   <div className="bg-white p-6 rounded-[2rem] flex flex-col items-center shadow-2xl">
                      <div className="relative w-40 h-40">
                        <Image src="/upi-qr.png" alt="UPI QR" fill className="object-contain" />
                      </div>
                      <div className="mt-4 text-center">
                         <p className="text-zinc-900 text-sm font-black font-mono">₹{totalAdvance} TOTAL</p>
                         <p className="text-zinc-400 text-[10px] font-bold mt-1 uppercase leading-none">{SITE_CONFIG.payment.upiId}</p>
                      </div>
                   </div>
                </div>

                {/* Form Card */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-cricket-green mb-1">
                      <div className="h-5 w-5 bg-cricket-green rounded-full flex items-center justify-center text-black font-black text-[10px]">2</div>
                      <h3 className="text-xs font-black uppercase tracking-widest">Submission Details</h3>
                   </div>
                   <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                        <input
                          type="text" required placeholder="Full Name"
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-11 pr-4 py-4 text-sm focus:bg-white/10 transition-all font-medium"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                        <input
                          type="tel" required maxLength={10} placeholder="Phone Number"
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-11 pr-4 py-4 text-sm focus:bg-white/10 transition-all font-medium"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                        <input
                          type="text" required placeholder="Txn ID (Last 4)"
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-11 pr-4 py-4 text-sm focus:bg-white/10 transition-all font-medium"
                          value={formData.txnid}
                          onChange={(e) => setFormData({ ...formData, txnid: e.target.value })}
                        />
                      </div>
                   </form>
                </div>
              </div>

              {/* Confirmed Details */}
              <div className="bg-zinc-800/30 p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                 <div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Slots</p>
                    <p className="text-white font-black text-sm">{slotText}</p>
                 </div>
                 <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full md:w-auto bg-cricket-green text-white font-black px-10 py-5 rounded-[1.5rem] shadow-[0_15px_30px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95 transition-all disabled:bg-zinc-700 disabled:text-zinc-500 flex items-center justify-center gap-2"
                 >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Confirm Booking</span> <Hash className="h-4 w-4" /></>}
                 </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
