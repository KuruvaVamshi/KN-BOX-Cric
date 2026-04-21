"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Filter, ArrowRight, Lightbulb, Trash2 } from "lucide-react";
import SlotCard from "@/components/SlotCard";
import BookingModal from "@/components/BookingModal";
import { SLOTS_DATA, SITE_CONFIG } from "@/lib/constants";
import { Slot } from "@/types";
import DateSelector from "@/components/DateSelector";
import { fetchLiveBookings } from "@/lib/google-sheets";

export default function SlotsPage() {
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filter, setFilter] = useState<"all" | "available">("all");
  const [liveSlots, setLiveSlots] = useState<Slot[]>([...SLOTS_DATA]);
  const [isSyncing, setIsSyncing] = useState(false);
  // Tracks slot IDs booked in this session (key: dateStr_slotId)
  // Survives 10-second sync intervals until Google Sheets catches up
  const localPending = useRef<Set<string>>(new Set());

  function getDateStr(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Match slot time exactly in comma-separated booking string
  function slotMatchesRecord(recordSlotStr: string, slotTime: string): boolean {
    // Split the booking string by comma and trim each part
    const bookedTimes = recordSlotStr.split(",").map((s) => s.trim());
    return bookedTimes.includes(slotTime);
  }

  async function syncBookings() {
    setIsSyncing(true);
    try {
      const records = await fetchLiveBookings();

      const now = new Date();
      const isToday = selectedDate.toDateString() === now.toDateString();
      const currentHour = now.getHours();
      const currentDateStr = getDateStr(selectedDate);

      const updatedSlots = SLOTS_DATA.map((slot) => {
        const localKey = `${currentDateStr}_${slot.id}`;
        const isLocallyPending = localPending.current.has(localKey);

        // Use exact match (split by comma) to avoid false positives
        const record = records.find(
          (r) =>
            slotMatchesRecord(r.slot, slot.time) && r.date === currentDateStr
        );

        let status: any = slot.status;

        // Auto-expire past slots for today
        if (isToday) {
          const match = slot.time.match(/(\d+)\s*(AM|PM)/);
          if (match) {
            let hour = parseInt(match[1]);
            const ampm = match[2];
            if (ampm === "PM" && hour !== 12) hour += 12;
            if (ampm === "AM" && hour === 12) hour = 0;
            if (hour < currentHour) status = "expired";
          }
        }

        if (status !== "expired") {
          if (record) {
            const rowStatus = record.status.trim().toLowerCase();
            const isConfirmed = rowStatus.includes("confirm") || 
                                rowStatus.includes("booked") || 
                                rowStatus.includes("paid") || 
                                rowStatus === "t";
            
            const isRejected = rowStatus.includes("reject") || rowStatus.includes("cancel");

            if (isConfirmed) {
              status = "booked";
            } else if (isRejected) {
              status = "available";
            } else {
              status = "pending";
            }
            
            // Sheet has this slot — remove from local memory
            localPending.current.delete(localKey);
          } else if (isLocallyPending) {
            // Sheet hasn't updated yet but user just booked it — keep pending
            status = "pending";
          }
        }

        return { ...slot, status } as Slot;
      });

      setLiveSlots(updatedSlots);
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }

  useEffect(() => {
    syncBookings();
    const interval = setInterval(syncBookings, 10000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const toggleSlot = (slot: Slot) => {
    setSelectedSlots((prev) => {
      const exists = prev.find((s) => s.id === slot.id);
      if (exists) return prev.filter((s) => s.id !== slot.id);
      return [...prev, slot];
    });
  };

  const handleBookingSuccess = (bookedSlots: Slot[]) => {
    const dateStr = getDateStr(selectedDate);
    // Register locally so syncBookings won't overwrite before sheet updates
    bookedSlots.forEach((s) => {
      localPending.current.add(`${dateStr}_${s.id}`);
    });

    // Optimistically update the UI immediately
    setLiveSlots((prev) =>
      prev.map((s) => {
        if (bookedSlots.some((bs) => bs.id === s.id)) {
          return { ...s, status: "pending" };
        }
        return s;
      })
    );

    setSelectedSlots([]);
    
    // Trigger an immediate sync to ensure everything is aligned
    syncBookings();
  };

  const filteredSlots = liveSlots.filter((s) => {
    if (s.status === "expired") return false;
    if (filter === "available") return s.status === "available";
    return true;
  });

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto space-y-12 pb-32">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-cricket-green">
            <Calendar className="h-5 w-5" />
            <span className="font-bold uppercase tracking-widest text-xs">
              Booking Schedule
            </span>
            {isSyncing && (
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full ml-2 font-bold"
              >
                Updating Live...
              </motion.span>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                Available <br />
                <span className="text-cricket-green">Slots</span>
              </h1>
              <p className="text-zinc-500 max-w-sm text-sm font-medium">
                Reserve your session at {SITE_CONFIG.name}. Select multiple
                hours for a longer game.
              </p>
            </div>

            <div className="bg-cricket-green/10 border border-cricket-green/20 p-4 rounded-2xl flex items-start gap-4 max-w-xs transition-all hover:bg-cricket-green/20">
              <Lightbulb className="h-5 w-5 text-cricket-green shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">
                <span className="text-white font-bold block mb-1">PRO TIP:</span>
                You can select{" "}
                <span className="text-cricket-green font-bold text-xs">
                  multiple slots
                </span>{" "}
                for longer consecutive matches!
              </p>
            </div>
          </div>
        </div>

        <DateSelector selectedDate={selectedDate} onSelect={setSelectedDate} />

        {/* Filters & Content */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-8 border-y border-white/5">
            <div className="flex items-center space-x-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <div className="flex items-center space-x-2.5">
                <div className="h-2 w-2 rounded-full bg-cricket-green shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                <span>Confirmed</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                <span>Pending</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 bg-zinc-900 border border-white/10 p-1 rounded-2xl">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                  filter === "all"
                    ? "bg-white text-black shadow-xl"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilter("available")}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                  filter === "available"
                    ? "bg-white text-black shadow-xl"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Available
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSlots.map((slot, i) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <SlotCard
                  slot={slot}
                  isSelected={selectedSlots.some((s) => s.id === slot.id)}
                  onSelect={toggleSlot}
                />
              </motion.div>
            ))}
          </div>

          {filteredSlots.length === 0 && (
            <div className="py-24 text-center space-y-4">
              <div className="h-20 w-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto border border-white/5">
                <Clock className="h-10 w-10 text-zinc-800" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black">No slots found</h3>
                <p className="text-zinc-500 text-sm">
                  Try changing filters or selecting another date.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <BookingModal
            slots={selectedSlots}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleBookingSuccess}
            selectedDate={selectedDate}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedSlots.length > 0 && !isModalOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] w-[95%] max-w-2xl px-4"
          >
            <div className="bg-white p-4 sm:p-5 rounded-[2.5rem] flex items-center justify-between shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/20">
              <div className="flex items-center space-x-4 ml-2">
                <button
                  onClick={() => setSelectedSlots([])}
                  className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 hover:scale-105 transition-all"
                  title="Clear All"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-black font-black leading-none text-sm">
                    {selectedSlots.length} SLOT
                    {selectedSlots.length > 1 ? "S" : ""} SELECTED
                  </p>
                  <p className="text-zinc-500 text-[10px] font-black uppercase mt-1 tracking-widest italic">
                    {selectedSlots.length} Hour
                    {selectedSlots.length > 1 ? "s" : ""} Duration
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-cricket-green text-white font-black px-8 py-5 rounded-[2rem] flex items-center space-x-3 hover:scale-[1.03] transition-all active:scale-[0.98] shadow-lg"
              >
                <span className="uppercase tracking-widest text-xs">
                  Book Sessions
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}