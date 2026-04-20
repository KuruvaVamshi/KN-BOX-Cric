import { SITE_CONFIG } from "@/lib/constants";
import { Mail, Phone, MapPin, Globe, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              {SITE_CONFIG.name.split(" ")[0]}{" "}
              <span className="text-cricket-green">
                {SITE_CONFIG.name.split(" ").slice(1).join(" ")}
              </span>
            </h3>
            <p className="text-zinc-400 max-w-xs">{SITE_CONFIG.tagline}</p>
            <div className="flex items-center space-x-4">
              <Globe className="h-5 w-5 text-zinc-400 hover:text-cricket-green cursor-pointer transition-colors" />
              <MessageSquare className="h-5 w-5 text-zinc-400 hover:text-cricket-green cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Quick Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-zinc-400">
                <Phone className="h-4 w-4 text-cricket-green" />
                <span>{SITE_CONFIG.contact.phone}</span>
              </li>
              <li className="flex items-center space-x-3 text-zinc-400">
                <MapPin className="h-4 w-4 text-cricket-green" />
                <span>Beside Sangameshwara Temple, Alampur, TG</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Opening Hours
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex justify-between">
                <span>Mon - Sun</span>
                <span className="text-white font-medium">7:00 AM - 11:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-zinc-500 text-sm">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
