"use client";

import { motion } from "framer-motion";
import { Check, Calendar, Lock, Clock } from "lucide-react";
import { Slot } from "@/types";
import { cn } from "@/lib/utils";
import { getPriceByTime } from "@/lib/pricing-utils";
import { SITE_CONFIG } from "@/lib/constants";

interface SlotCardProps {
  slot: Slot;
  onSelect: (slot: Slot) => void;
  isSelected?: boolean;
}

export default function SlotCard({ slot, onSelect, isSelected }: SlotCardProps) {
  const isAvailable = slot.status === "available";
  const isBooked = slot.status === "booked";
  const isPending = slot.status === "pending";

  return (
    <motion.div
      whileHover={isAvailable ? { y: -5, scale: 1.02 } : {}}
      whileTap={isAvailable ? { scale: 0.98 } : {}}
      onClick={() => isAvailable && onSelect(slot)}
      className={cn(
        "glass-card p-6 rounded-3xl flex flex-col justify-between group relative overflow-hidden transition-all duration-500 cursor-pointer",
        isBooked && "opacity-40 grayscale cursor-not-allowed",
        isPending && "border-yellow-500/30",
        isSelected && "border-cricket-green ring-4 ring-cricket-green/20 ring-inset bg-cricket-green/10 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
      )}
    >
      {/* Checkbox Visual - High Discovery for Multi-selection */}
      {isAvailable && (
        <div className="absolute top-4 right-4">
          <div className={cn(
            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
            isSelected 
              ? "bg-cricket-green border-cricket-green shadow-[0_0_15px_rgba(34,197,94,0.5)]" 
              : "border-white/10 bg-white/5"
          )}>
            {isSelected && <Check className="h-4 w-4 text-white" strokeWidth={4} />}
          </div>
        </div>
      )}

      {/* Visual Status Bar */}
      <div
        className={cn(
          "absolute top-0 left-0 h-1 w-full",
          isAvailable && !isSelected && "bg-white/10",
          isSelected && "bg-cricket-green",
          isBooked && "bg-red-500",
          isPending && "bg-yellow-500"
        )}
      />

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "p-2.5 rounded-xl transition-colors",
            isAvailable ? "bg-cricket-green/10 text-cricket-green" : "bg-white/5 text-zinc-500"
          )}>
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight leading-none">{slot.time}</h3>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest mt-1",
              isAvailable && !isSelected && "text-zinc-500",
              isSelected && "text-cricket-green",
              isBooked && "text-red-500",
              isPending && "text-yellow-500"
            )}>
              {isAvailable ? (isSelected ? "Selected" : "Available") : slot.status}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
           <span className="text-xs font-bold text-zinc-500 italic">
             ₹{getPriceByTime(slot.time)}/hr
           </span>
           {isBooked ? (
             <span className="text-[10px] font-black text-red-500/50 uppercase tracking-tighter">Reserved</span>
           ) : isPending ? (
             <span className="text-[10px] font-black text-yellow-500/50 uppercase tracking-tighter">Waiting Approval</span>
           ) : null}
        </div>
      </div>
    </motion.div>
  );
}
