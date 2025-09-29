import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, Star, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Topbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Navigate to login even if logout API fails
      navigate('/login');
    }
  };

  return (
    <header className="h-16 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 motion-safe:animate-pop shadow-bubbly/50">
      <div className="flex items-center gap-2 text-sm">
        <span className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/80 border-2 border-yellow-300 px-4 py-2 text-yellow-700 shadow-bubbly motion-safe:animate-pulse-glow">
          <Star className="size-4 text-yellow-500 animate-pulse" />
          <span className="font-semibold">Daily Streak: 7</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications" className="rounded-xl hover:bg-blue-100 hover:shadow-bubbly transition-all motion-safe:animate-pop">
          <Bell className="size-5 text-blue-600 motion-safe:animate-float-soft" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="rounded-full pl-1 pr-3 bg-white/80 hover:bg-white/90 border-2 border-transparent hover:border-blue-300 motion-safe:animate-pulse-glow shadow-bubbly transition-all">
              <img src="https://api.dicebear.com/9.x/open-peeps/svg?mood=happy" alt="User avatar" className="size-8 rounded-full motion-safe:animate-float-soft border-2 border-red-300" />
              <span className="ml-2 hidden sm:block font-medium text-foreground">
                {user?.firstName || user?.username || 'User'}
              </span>
              <ChevronDown className="ml-1 size-4 text-blue-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl bg-white/90 backdrop-blur border-2 border-blue-200 shadow-bubbly motion-safe:animate-pop p-2">
            <DropdownMenuLabel className="px-4 py-3 text-lg font-semibold text-red-700 flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-500 animate-pulse" />
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 border-purple-300" />
            <DropdownMenuItem 
              onClick={() => navigate('/profile')}
              className="rounded-xl mx-1 my-1 flex items-center gap-3 px-4 py-3 hover:bg-red-100 transition-colors cursor-pointer text-red-700 hover:text-red-800"
            >
              <div className="size-2 rounded-full bg-yellow-500" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/settings')}
              className="rounded-xl mx-1 my-1 flex items-center gap-3 px-4 py-3 hover:bg-blue-100 transition-colors cursor-pointer text-blue-700 hover:text-blue-800"
            >
              <div className="size-2 rounded-full bg-blue-600" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 border-pink-300" />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="rounded-xl mx-1 my-1 flex items-center gap-3 px-4 py-3 hover:bg-rose-100 transition-colors cursor-pointer text-rose-700 hover:text-rose-800"
            >
              <LogOut className="size-4 text-rose-500" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
