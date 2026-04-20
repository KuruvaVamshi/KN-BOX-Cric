import Link from "next/link";
import { Trophy, Clock, CreditCard, ChevronRight, Star, MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cricket-green/20 to-transparent z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cricket-green text-sm font-medium animate-fade-in">
            <Trophy className="h-4 w-4" />
            <span>Top Rated Box Cricket in the City</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-tight">
            BOOK YOUR <br />
            <span className="text-cricket-green italic">VICTORY</span> SLOTS
          </h1>
          
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
            {SITE_CONFIG.tagline}. High-quality turf, professional lighting, and an atmosphere built for champions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/slots"
              className="w-full sm:w-auto bg-cricket-green hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
            >
              <span>Book Now</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}`}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2 border border-white/10"
            >
              <MessageCircle className="h-5 w-5" />
              <span>WhatsApp Us</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-950 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Why Choose Us?</h2>
            <p className="text-zinc-500">Premium facilities for the best cricketing experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Clock, 
                title: "24/7 Availability", 
                desc: "Book your preferred slot anytime, day or night." 
              },
              { 
                icon: Star, 
                title: "Premium Turf", 
                desc: "High-grade artificial grass for perfect bounce and grip." 
              },
              { 
                icon: CreditCard, 
                title: "Easy Booking", 
                desc: "Secure your slot with a 50% advance payment online." 
              },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl space-y-4">
                <div className="p-3 bg-cricket-green/10 rounded-2xl w-fit">
                  <feature.icon className="h-8 w-8 text-cricket-green" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto glass-card p-12 rounded-[3rem] text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy className="h-48 w-48 text-cricket-green rotate-12" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black italic">SIMPLE PRICING</h2>
            <p className="text-zinc-400">No hidden charges. Just pure cricket.</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <span className="text-7xl font-black text-cricket-green">₹{SITE_CONFIG.pricing}</span>
            <span className="text-2xl font-bold text-zinc-500">/ HOUR</span>
          </div>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
            {["Premium Lighting", "Waiting Area", "Equipment Available", "Parking Space"].map((item, i) => (
              <li key={i} className="flex items-center space-x-3 text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-cricket-green" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          
          <Link
            href="/slots"
            className="inline-block bg-cricket-green hover:bg-green-600 text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] mt-8"
          >
            Check Availability
          </Link>
        </div>
      </section>
    </div>
  );
}