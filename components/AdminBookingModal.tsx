"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, Loader2, User, Phone, Calendar, Clock, Hash } from "lucide-react";
import { SLOTS_DATA, SITE_CONFIG } from "@/lib/constants";
import { toast } from "sonner";
import { addManualBooking } from "@/lib/admin-actions";
import { sendBookingAlerts } from "@/lib/notifications";
import Swal from "sweetalert2";

interface AdminBookingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminBookingModal({ onClose, onSuccess }: AdminBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: new Date().toISOString().split('T')[0],
    slot: "",
    txnid: `MANUAL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.slot || !formData.date) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all required fields to proceed.',
        confirmButtonColor: '#22c55e',
      });
      return;
    }

    setLoading(true);
    try {
      await addManualBooking(formData);
      
      // Send WhatsApp Notification
      try {
        await sendBookingAlerts({
          name: formData.name,
          phone: formData.phone,
          slot: formData.slot,
          date: formData.date,
          txnid: formData.txnid,
        });
      } catch (notifyError) {
        console.error("Manual booking notification failed:", notifyError);
      }

      Swal.fire({
        icon: 'success',
        title: 'Booking Added',
        text: 'Manual booking has been recorded successfully.',
        confirmButtonColor: '#22c55e',
        timer: 2000,
        showConfirmButton: false,
      });
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add manual booking. Please try again.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Manual Booking</h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Admin Control Overlay</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="h-6 w-6 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Customer Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input
                  type="text" required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm focus:border-cricket-green transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input
                  type="tel" required maxLength={10}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm focus:border-cricket-green transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Booking Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input
                  type="date" required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm focus:border-cricket-green transition-all color-scheme-dark"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Select Slot</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <select
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm focus:border-cricket-green transition-all appearance-none"
                  value={formData.slot}
                  onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                >
                  <option value="" disabled className="bg-zinc-900">Choose Slot</option>
                  {SLOTS_DATA.map(s => (
                    <option key={s.id} value={s.time} className="bg-zinc-900">{s.time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-2">Reference ID (Auto-generated)</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm text-zinc-500 cursor-not-allowed"
                value={formData.txnid}
                readOnly
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-cricket-green transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Add Booking <CheckCircle2 className="h-5 w-5" /></>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
