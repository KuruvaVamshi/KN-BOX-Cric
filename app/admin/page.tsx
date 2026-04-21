"use client";

import { Trophy, CheckCircle, IndianRupee, ArrowUpRight, Phone, Calendar, Clock, Lock, ShieldAlert, LogOut, Plus, Check, X as CloseIcon, Loader2, AlertCircle } from "lucide-react";
import { fetchLiveBookings, BookingRecord } from "@/lib/google-sheets";
import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/lib/constants";
import AdminBookingModal from "@/components/AdminBookingModal";
import { updateBookingStatus } from "@/lib/admin-actions";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { getPriceByTime } from "@/lib/pricing-utils";

export default function AdminPage() {
  const [records, setRecords] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Check for existing session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("admin_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  async function loadStats() {
    if (!isAuthenticated) return;
    const data = await fetchLiveBookings();
    setRecords(data);
    setLoading(false);
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      const interval = setInterval(loadStats, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "VNA@1432";

    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      setError("");
    } else {
      setError("Invalid password. Please try again.");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_auth");
  };

  const handleStatusUpdate = async (record: BookingRecord, status: "Confirmed" | "Rejected") => {
    const id = `${record.txnid}_${record.phone}`;
    setUpdatingId(id);
    try {
      await updateBookingStatus(record.txnid, record.phone, status);
      Swal.fire({
        icon: 'success',
        title: `Booking ${status}`,
        text: `The booking for ${record.name} has been ${status.toLowerCase()} successfully.`,
        confirmButtonColor: '#22c55e',
        timer: 1500,
        showConfirmButton: false,
      });
      // Optimistic update
      setRecords(prev => prev.map(r =>
        (r.txnid === record.txnid && r.phone === record.phone) ? { ...r, status: status === "Confirmed" ? "Confirmed" : "REJECTED" } : r
      ));
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Status update failed. Make sure GAS API is configured correctly.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (record: BookingRecord) => {
    const confirm = await Swal.fire({
      title: 'Delete Booking?',
      text: `Are you sure you want to delete ${record.name}'s booking? This is permanent.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'Yes, Delete'
    });

    if (confirm.isConfirmed) {
      const id = `${record.txnid}_${record.phone}`;
      setUpdatingId(id);
      try {
        await import("@/lib/admin-actions").then(m => m.deleteBooking(record.txnid, record.phone));
        toast.success("Booking deleted successfully");
        setRecords(prev => prev.filter(r => r.txnid !== record.txnid || r.phone !== record.phone));
      } catch (err) {
        toast.error("Failed to delete booking");
      } finally {
        setUpdatingId(null);
      }
    }
  };

  // Password Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-3xl bg-cricket-green/10 border border-cricket-green/20 mb-6">
              <Lock className="h-8 w-8 text-cricket-green" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Restricted Access</h1>
            <p className="text-zinc-500">Enter the admin password to access the dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cricket-green/50 focus:border-cricket-green transition-all"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 mt-3 text-red-500 text-xs font-bold uppercase tracking-wider px-2">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-cricket-green hover:text-black transition-all active:scale-[0.98]"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Date Logic (IST Friendly) ---
  const todayDate = new Date();
  const today = todayDate.toLocaleDateString('en-CA'); // Local YYYY-MM-DD
  
  const yesterdayDate = new Date();
  yesterdayDate.setDate(todayDate.getDate() - 1);
  const yesterday = yesterdayDate.toLocaleDateString('en-CA');

  // Categorize records with robust status matching
  const categorizedBookings = records.reduce((acc, record) => {
    const s = record.status.trim().toLowerCase();
    const isConfirmed = s.includes("confirm") || s.includes("booked") || s.includes("paid") || s === "t";
    const isRejected = s.includes("reject") || s.includes("cancel");
    const isPending = !isConfirmed && !isRejected;
    const bookingDate = record.date; 

    if (isPending) {
      if (bookingDate > today) acc.upcoming.push(record);
      else acc.today.push(record);
    } else if (isConfirmed) {
      // KEEP TODAY AND YESTERDAY IN THE FIRST COLUMN
      if (bookingDate < yesterday) acc.history.push(record);
      else acc.today.push(record);
    } else if (isRejected) {
      if (bookingDate < yesterday) acc.history.push(record);
      else acc.today.push(record);
    }

    return acc;
  }, { 
    today: [] as BookingRecord[], 
    upcoming: [] as BookingRecord[], 
    history: [] as BookingRecord[] 
  });

  // --- Stats Calculation ---
  const confirmedRecords = records.filter(r => {
    const s = r.status.trim().toLowerCase();
    return s.includes("confirm") || s.includes("booked") || s.includes("paid") || s === "t";
  });

  const totalHoursBooked = confirmedRecords.reduce((acc, r) => acc + (r.slot.split(",").length), 0);
  
  let totalRevenue = 0;
  confirmedRecords.forEach(r => {
    const slotTimes = r.slot.split(",").map(s => s.trim());
    slotTimes.forEach(time => {
      totalRevenue += getPriceByTime(time);
    });
  });

  const pendingBookings = records.length - confirmedRecords.length;

  const statsList = [
    { label: "Total confirmed hours", value: totalHoursBooked.toString(), icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Approvals", value: pendingBookings.toString(), icon: CheckCircle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const BookingTable = ({ title, bookings, type }: { title: string, bookings: BookingRecord[], type: 'today' | 'upcoming' | 'history' }) => (
    <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-xl">
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${type === 'today' ? 'bg-cricket-green text-shadow-glow' : type === 'upcoming' ? 'bg-blue-500' : 'bg-zinc-500'}`} />
          {title}
        </h3>
        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-zinc-500 font-bold">{bookings.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.01] text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Time/Date</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {bookings.sort((a, b) => b.date.localeCompare(a.date)).map((booking, i) => {
              const s = booking.status.trim().toLowerCase();
              const isConfirmed = s.includes("confirm") || s.includes("booked") || s.includes("paid") || s === "t";
              const isRejected = s.includes("reject") || s.includes("cancel");
              const recordKey = `${booking.txnid}_${booking.phone}`;
              const isUpdating = updatingId === recordKey;

              return (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white group-hover:text-cricket-green transition-colors leading-tight">{booking.name}</p>
                    <p className="text-zinc-500 text-[10px] mt-1">{booking.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] font-bold uppercase">
                        <Calendar className="h-3 w-3" />
                        {booking.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <Clock className="h-3 w-3 text-cricket-green" />
                        {booking.slot}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {isConfirmed ? (
                      <span className="text-xs font-black uppercase text-cricket-green shadow-glow">Confirmed</span>
                    ) : isRejected ? (
                      <span className="text-[10px] font-black uppercase text-red-500">Rejected</span>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-yellow-500">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isConfirmed && !isRejected && (
                        <button
                          onClick={() => handleStatusUpdate(booking, "Confirmed")}
                          className="p-2 rounded-lg bg-cricket-green/10 text-cricket-green hover:bg-cricket-green hover:text-black transition-all"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {isUpdating ? (
                        <div className="p-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(booking)}
                          className="p-2 rounded-lg bg-white/5 text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all"
                        >
                          <CloseIcon className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-600 italic text-[10px] uppercase tracking-widest">
                  No {title.toLowerCase()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-16 px-6 bg-black text-white">
      <div className="max-w-[1600px] mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight uppercase leading-none">Admin <span className="text-cricket-green italic">Control</span></h1>
            <p className="text-zinc-500 text-sm">Real-time management for {SITE_CONFIG.name}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-white text-black rounded-2xl flex items-center space-x-2 hover:bg-cricket-green transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">New Session</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-3 bg-zinc-900 border border-white/5 rounded-2xl flex items-center space-x-2 text-zinc-400 hover:text-red-500 hover:border-red-500/50 transition-all font-bold"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsList.map((stat, i) => (
            <div key={i} className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 flex items-center gap-4 backdrop-blur-sm">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <BookingTable title="Today's Matches" bookings={categorizedBookings.today} type="today" />
          <BookingTable title="Upcoming" bookings={categorizedBookings.upcoming} type="upcoming" />
          <BookingTable title="Confirmed History" bookings={categorizedBookings.history} type="history" />
        </div>
      </div>

      {isModalOpen && (
        <AdminBookingModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadStats}
        />
      )}
    </div>
  );
}
