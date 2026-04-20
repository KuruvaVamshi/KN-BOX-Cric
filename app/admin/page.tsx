"use client";

import { Trophy, CheckCircle, IndianRupee, ArrowUpRight, Phone, Calendar, Clock } from "lucide-react";
import { fetchLiveBookings, BookingRecord } from "@/lib/google-sheets";
import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/lib/constants";

export default function AdminPage() {
  const [records, setRecords] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    const data = await fetchLiveBookings();
    setRecords(data);
    setLoading(false);
  }

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Smart Stats Calculation
  // We split slot strings (e.g. "7 AM - 8 AM, 8 AM - 9 AM") to count individual hours
  const confirmedRecords = records.filter(r => 
    r.status.trim().toLowerCase() === 't' || r.status.trim().toLowerCase() === 'confirmed'
  );
  
  const totalHoursBooked = confirmedRecords.reduce((acc, r) => {
    const hours = r.slot.split(",").length;
    return acc + hours;
  }, 0);

  const pendingBookings = records.length - confirmedRecords.length;
  const totalRevenue = totalHoursBooked * (typeof SITE_CONFIG.pricing === 'number' ? SITE_CONFIG.pricing : 500);

  const statsList = [
    { label: "Total confirmed hours", value: totalHoursBooked.toString(), icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Approvals", value: pendingBookings.toString(), icon: CheckCircle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight uppercase">Admin Panel</h1>
            <p className="text-zinc-500">Live booking monitoring for {SITE_CONFIG.name}.</p>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-cricket-green animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Live Syncing</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsList.map((stat, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 flex items-center gap-6 backdrop-blur-sm">
              <div className={`p-4 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black mt-1 leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings Table */}
        <div className="glass-card rounded-[3rem] overflow-hidden border-white/5">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-xl font-bold">Recent Submissions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Customer Details</th>
                  <th className="px-8 py-5">Selected Slots</th>
                  <th className="px-8 py-5">Transaction ID</th>
                  <th className="px-8 py-5 text-right">Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {records.map((booking, i) => {
                  const isConfirmed = booking.status.trim().toLowerCase() === 't' || booking.status.trim().toLowerCase() === 'confirmed';
                  return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-bold text-white group-hover:text-cricket-green transition-colors">{booking.name}</p>
                        <p className="text-zinc-500 text-xs flex items-center gap-1.5 mt-1.5">
                          <Phone className="h-3 w-3" /> {booking.phone}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-zinc-300">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{booking.date || "Today"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white">
                            <Clock className="h-3.5 w-3.5 text-cricket-green" />
                            <span className="font-medium text-xs bg-zinc-800/50 px-2 py-0.5 rounded-md">{booking.slot}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-zinc-500 text-xs tracking-tight">
                        {booking.txnid}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {isConfirmed ? (
                          <span className="px-4 py-1.5 rounded-full bg-cricket-green/10 text-cricket-green text-[10px] font-black uppercase tracking-widest border border-cricket-green/20">
                            Confirmed
                          </span>
                        ) : (
                          <span className="px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {records.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-500">
                      No bookings found in the Google Sheet yet.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 italic">
                      Fetching live data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
