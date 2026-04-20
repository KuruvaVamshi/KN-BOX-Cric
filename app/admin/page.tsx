"use client";

import { Trophy, CheckCircle, IndianRupee, ArrowUpRight, Phone, Calendar, Clock, Lock, ShieldAlert, LogOut, Plus, Check, X as CloseIcon, Loader2, AlertCircle } from "lucide-react";
import { fetchLiveBookings, BookingRecord } from "@/lib/google-sheets";
import { useEffect, useState } from "react";
import { SITE_CONFIG } from "@/lib/constants";
import AdminBookingModal from "@/components/AdminBookingModal";
import { updateBookingStatus } from "@/lib/admin-actions";
import { toast } from "sonner";
import Swal from "sweetalert2";

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
        (r.txnid === record.txnid && r.phone === record.phone) ? { ...r, status: status === "Confirmed" ? "T" : "REJECTED" } : r
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

  // Password Gate UI
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

          <p className="text-center mt-8 text-zinc-600 text-xs uppercase tracking-widest font-bold">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    );
  }

  // Smart Stats Calculation
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight uppercase leading-none">Admin <span className="text-cricket-green italic">Control</span></h1>
            <p className="text-zinc-500 text-sm">Monitoring and managing {SITE_CONFIG.name} bookings.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-white text-black rounded-2xl flex items-center space-x-2 hover:bg-cricket-green transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Manual Booking</span>
            </button>
            <button 
              onClick={handleLogout}
              className="p-3 bg-zinc-900 border border-white/5 rounded-2xl flex items-center space-x-2 text-zinc-400 hover:text-red-500 hover:border-red-500/50 transition-all font-bold"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Logout</span>
            </button>
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-cricket-green animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Live Syncing</span>
            </div>
          </div>
        </div>

        {!process.env.NEXT_PUBLIC_GAS_API_URL && isAuthenticated && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-4 text-yellow-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wide">
              Backend API not configured. Status updates (Confirm/Reject) will not be saved to Google Sheets yet.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsList.map((stat, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 flex items-center gap-6 backdrop-blur-sm shadow-xl">
              <div className={`p-4 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-3xl font-black mt-1 leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings Table */}
        <div className="glass-card rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-xl font-bold uppercase tracking-tight">Recent Submissions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Customer Details</th>
                  <th className="px-8 py-5">Selected Slots</th>
                  <th className="px-8 py-5">Transaction ID</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {records.map((booking, i) => {
                  const s = booking.status.trim().toLowerCase();
                  const isConfirmed = s === 't' || s === 'confirmed';
                  const isRejected = s === 'rejected';
                  const isPending = !isConfirmed && !isRejected;
                  const recordKey = `${booking.txnid}_${booking.phone}`;
                  const isUpdating = updatingId === recordKey;

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
                          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{booking.date || "Today"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white">
                            <Clock className="h-3.5 w-3.5 text-cricket-green" />
                            <span className="font-medium text-xs bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-white/5">{booking.slot}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-zinc-500 text-xs tracking-tight">
                        {booking.txnid}
                      </td>
                      <td className="px-8 py-6 text-center">
                        {isConfirmed ? (
                          <span className="px-4 py-1.5 rounded-full bg-cricket-green/10 text-cricket-green text-[10px] font-black uppercase tracking-widest border border-cricket-green/20">
                            Confirmed
                          </span>
                        ) : isRejected ? (
                          <span className="px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          {!isConfirmed && !isRejected && (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(booking, "Confirmed")}
                                disabled={isUpdating}
                                className="h-9 w-9 rounded-xl bg-cricket-green text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                                title="Confirm"
                              >
                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(booking, "Rejected")}
                                disabled={isUpdating}
                                className="h-9 w-9 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center hover:scale-110 active:scale-95 hover:text-red-500 hover:bg-red-500/10 border border-white/5 transition-all disabled:opacity-50"
                                title="Reject"
                              >
                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloseIcon className="h-4 w-4" />}
                              </button>
                            </>
                          )}
                          {(isConfirmed || isRejected) && (
                            <button 
                              onClick={() => handleStatusUpdate(booking, isConfirmed ? "Rejected" : "Confirmed")}
                              disabled={isUpdating}
                              className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
                            >
                              Reset Status
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {records.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-zinc-500">
                      No bookings found in the Google Sheet yet.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-zinc-500 italic">
                      Fetching live data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
