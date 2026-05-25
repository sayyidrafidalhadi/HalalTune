import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Music, 
  Users, 
  Mic2, 
  FileText, 
  ShieldAlert, 
  BarChart3, 
  Tag, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/useSidebarStore";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Music, label: "Tracks", id: "tracks" },
  { icon: Mic2, label: "Artists", id: "artists" },
  { icon: FileText, label: "Reports", id: "reports" },
  { icon: ShieldAlert, label: "Moderation", id: "moderation" },
  { icon: BarChart3, label: "Analytics", id: "analytics" },
  { icon: Tag, label: "Categories", id: "categories" },
  { icon: Users, label: "Users", id: "users" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export function Sidebar() {
  const { isOpen, toggle, activePage, setActivePage, isMobileMenuOpen, toggleMobileMenu } = useSidebarStore();
  const { signOut } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ 
          width: isOpen ? 260 : 80,
          x: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -260 : 0)
        }}
        className={cn(
          "fixed inset-y-0 left-0 lg:relative h-screen border-r border-white/5 bg-amoled flex flex-col transition-all duration-300 ease-in-out z-[70]",
          !isOpen && "items-center",
          "lg:translate-x-0"
        )}
        style={{
          // Use a CSS variable or direct style for mobile x-translation to avoid layout shift on hydration
          transform: isMobileMenuOpen ? 'translateX(0)' : undefined
        }}
      >
        <div className="flex items-center h-16 px-6 mb-8 mt-4 justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg">
              <img src="/appicon.png" className="w-full h-full object-cover" alt="HalalTune Logo" />
            </div>
            {(isOpen || isMobileMenuOpen) && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold tracking-tight text-white"
              >
                HalalTune
              </motion.span>
            )}
          </div>
          {isMobileMenuOpen && (
            <button onClick={toggleMobileMenu} className="lg:hidden p-2 text-white/40">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                activePage === item.id 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-white/5 text-muted-foreground hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", !isOpen && !isMobileMenuOpen && "mx-auto")} />
              {(isOpen || isMobileMenuOpen) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              {!isOpen && !isMobileMenuOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-amoled-elevated border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                  {item.label}
                </div>
              )}
              {activePage === item.id && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={toggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-amoled-elevated border border-white/10 rounded-full hidden lg:flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="p-4 border-t border-white/5">
          <div className={cn("flex items-center gap-3", (!isOpen && !isMobileMenuOpen) && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-amoled-elevated border border-white/10 overflow-hidden flex items-center justify-center">
              <img src="/appicon.png" className="w-full h-full object-cover" alt="Admin" />
            </div>
            {(isOpen || isMobileMenuOpen) && (
              <div className="flex flex-col">                <span className="text-sm font-medium text-white">Admin User</span>
                <button 
                  onClick={() => signOut()}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-widest text-left mt-0.5"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
