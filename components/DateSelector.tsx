"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onSelect }: DateSelectorProps) {
  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatDate = (date: Date) => {
    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      num: date.getDate(),
      month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
    };
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
      {dates.map((date, i) => {
        const { day, num, month } = formatDate(date);
        const active = isSelected(date);

        return (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(date)}
            className={cn(
              "flex flex-col items-center min-w-[80px] py-4 rounded-2xl border transition-all duration-300",
              active
                ? "bg-cricket-green border-cricket-green text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                : "bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/10"
            )}
          >
            <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
              {day}
            </span>
            <span className="text-2xl font-black leading-none">{num}</span>
            <span className="text-[10px] font-bold uppercase mt-1 opacity-70">
              {month}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
