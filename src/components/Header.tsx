import React from "react";
import { History, Settings, ListFilter, User } from "lucide-react";

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenPrioritiesMobile: () => void;
  onOpenAuth: () => void;
  user: any;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenSettings,
  onOpenPrioritiesMobile,
  onOpenAuth,
  user,
}) => {
  return (
    <header className="bg-[#f7f9fb] text-[#24389c] font-bold text-2xl md:text-3xl flex justify-between items-center px-6 md:px-10 h-16 w-full max-w-[1200px] mx-auto shrink-0 z-20 border-b border-[#c5c5d4]/20">
      <div className="flex items-center gap-3">
        <span className="font-extrabold tracking-tight cursor-pointer hover:opacity-90 transition-opacity">
          Decide For Me
        </span>
      </div>

      <div className="flex gap-2.5 items-center">
        {/* Mobile Priorities Button */}
        <button
          onClick={onOpenPrioritiesMobile}
          className="lg:hidden p-2 text-[#454652] hover:text-[#24389c] hover:bg-[#eceef0] rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
          title="View Priorities"
        >
          <ListFilter className="w-5 h-5" />
          <span className="text-xs font-semibold hidden sm:inline">Priorities</span>
        </button>

        {/* History Icon */}
        <button
          onClick={onOpenHistory}
          className="p-2 text-[#454652] hover:text-[#24389c] hover:bg-[#eceef0] rounded-lg transition-colors"
          title="Decision History"
        >
          <History className="w-5 h-5" />
        </button>

        {/* Settings Icon */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-[#454652] hover:text-[#24389c] hover:bg-[#eceef0] rounded-lg transition-colors"
          title="Settings & Logic Modes"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Firebase User Auth Button */}
        <button
          onClick={onOpenAuth}
          className={`p-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            user
              ? "bg-[#3f51b5]/10 border-[#3f51b5]/30 text-[#3f51b5]"
              : "bg-white border-[#c5c5d4]/60 text-[#454652] hover:border-[#3f51b5]"
          }`}
          title={user ? `Signed in as ${user.email || 'Guest'}` : "Sign In / Firebase Sync"}
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">
            {user ? (user.email ? user.email.split("@")[0] : "Guest") : "Sign In"}
          </span>
        </button>
      </div>
    </header>
  );
};

