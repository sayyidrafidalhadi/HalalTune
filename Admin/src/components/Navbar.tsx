import { Search, Bell, User, Menu } from "lucide-react";
import { useSidebarStore } from "@/store/useSidebarStore";

export function Navbar() {
  const toggleMobileMenu = useSidebarStore((state) => state.toggleMobileMenu);

  return (
    <header className="h-16 border-b border-white/5 bg-amoled/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 text-muted-foreground hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search tracks, artists, users..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <button className="relative p-2 text-muted-foreground hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="h-8 w-[1px] bg-white/10 mx-1 lg:mx-2" />
        <button className="flex items-center gap-2 p-1 pl-1 pr-2 lg:pr-3 rounded-full hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-amoled-elevated flex items-center justify-center border border-white/10 overflow-hidden">
            <img src="/appicon.png" className="w-full h-full object-cover" alt="Admin Profile" />
          </div>
          <span className="text-sm font-medium hidden sm:inline">Profile</span>
        </button>
      </div>
    </header>
  );
}
