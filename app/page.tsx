import Link from "next/link";
import { Trophy, Clock, CreditCard, ChevronRight, Star, MessageCircle, Phone, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cricket-green/20 to-transparent z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-10 py-20">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cricket-green text-sm font-medium animate-fade-in">
            <Trophy className="h-4 w-4" />
            <span>Top Rated Box Cricket in the City</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl md:text-9xl font-black tracking-tight leading-none group">
              BOOK YOUR <br />
              <span className="text-cricket-green italic">VICTORY</span> SLOTS
            </h1>

            {/* Prominent Mobile Numbers */}
            <div className="flex flex-col items-center justify-center space-y-2 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
               <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">For Direct Bookings</p>
               <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                  <a href="tel:+919392454506" className="group flex flex-col items-center">
                    <span className="text-4xl md:text-6xl font-black text-white hover:text-cricket-green transition-colors cursor-pointer">9392454506</span>
                    <div className="h-1 w-0 group-hover:w-full bg-cricket-green transition-all duration-300 rounded-full mt-1" />
                  </a>
                  <a href="tel:+917569521993" className="group flex flex-col items-center">
                    <span className="text-4xl md:text-6xl font-black text-white hover:text-cricket-green transition-colors cursor-pointer">7569521993</span>
                    <div className="h-1 w-0 group-hover:w-full bg-cricket-green transition-all duration-300 rounded-full mt-1" />
                  </a>
               </div>
            </div>
          </div>
          
          <p className="text-zinc-400 text-lg md:xl max-w-2xl mx-auto font-medium">
            {SITE_CONFIG.tagline}. High-quality turf, professional lighting, and an atmosphere built for champions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/slots"
              className="w-full sm:w-auto bg-cricket-green hover:bg-green-600 text-white px-10 py-5 rounded-3xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-[0_20px_50px_rgba(34,197,94,0.4)]"
            >
              <span>Book Your Slot</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-950 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-5xl font-black uppercase tracking-tight italic">Why Choose <span className="text-cricket-green">KN BOX?</span></h2>
            <p className="text-zinc-500 font-medium">Premium facilities for the best cricketing experience.</p>
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
                desc: "Secure your slot with a simple advance payment." 
              },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-10 rounded-[2.5rem] space-y-6 border-white/5 hover:border-cricket-green/30 transition-all group">
                <div className="p-4 bg-cricket-green/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-cricket-green" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-zinc-500 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Location Section */}
      <section className="py-24 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Pricing Card */}
          <div className="glass-card p-12 rounded-[3.5rem] text-center space-y-8 relative overflow-hidden h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Trophy className="h-64 w-64 text-cricket-green rotate-12" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter">Simple Pricing</h2>
              <p className="text-zinc-400 font-medium">No hidden charges. Just pure cricket.</p>
            </div>
            
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-6xl md:text-8xl font-black text-cricket-green">₹{SITE_CONFIG.dayPrice}</span>
                <span className="text-xl font-bold text-zinc-500 uppercase">/ Day Hour</span>
              </div>
              <div className="flex items-baseline space-x-3">
                <span className="text-5xl md:text-7xl font-black text-white/90">₹{SITE_CONFIG.nightPrice}</span>
                <span className="text-lg font-bold text-zinc-500 uppercase">/ Night Hour</span>
              </div>
            </div>
            
            <ul className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-lg mx-auto text-left py-4">
              {["Premium Lighting", "Waiting Area", "Equipment", "Parking Space"].map((item, i) => (
                <li key={i} className="flex items-center space-x-3 text-zinc-400 font-medium">
                  <div className="h-2 w-2 rounded-full bg-cricket-green" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <Link
              href="/slots"
              className="inline-block bg-white text-black hover:bg-cricket-green hover:text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl mt-4"
            >
              Check Availability
            </Link>
          </div>

          {/* Location Card */}
          <div className="glass-card p-8 rounded-[3.5rem] border-white/5 space-y-6 flex flex-col h-full">
            <div className="flex items-center gap-4 px-4 pt-4">
               <div className="p-3 bg-zinc-900 rounded-2xl">
                 <MapPin className="h-6 w-6 text-cricket-green" />
               </div>
               <div>
                 <h3 className="text-2xl font-black uppercase tracking-tight">Our Location</h3>
                 <p className="text-zinc-500 text-sm font-medium">Beside Sangameshwara Temple, Alampur, TG</p>
               </div>
            </div>
            
            <div className="flex-1 min-h-[400px] rounded-[2rem] overflow-hidden border border-white/10 group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3647.730558944073!2d78.1293261!3d15.8769549!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb5e988338e58d1%3A0x506295cc96630579!2sKN%20BOX%20CRICKET!5e1!3m2!1sen!2sin!4v1776667067974!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full transition-all duration-700"
              />
            </div>

            <a 
              href="https://maps.app.goo.gl/NLfb5XS3hHtDnQHt8?g_st=aw" 
              target="_blank" 
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white py-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest transition-all"
            >
              Open in Google Maps
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
