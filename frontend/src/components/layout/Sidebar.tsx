import { NavLink, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Bot, Home, MessageCircle, HeartHandshake, BarChart3, Sparkles, Brain, Moon, NotebookPen, Settings2 } from "lucide-react";
import { set } from "date-fns";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home, color: "blue" },
  { to: "/chat", label: "AI Chat", icon: MessageCircle, color: "purple" },
  {
    to: "/wellness",
    label: "Wellness",
    icon: HeartHandshake,
    color: "red",
    children: [
      { to: "/meditation", label: "Meditation", icon: Moon },
      { to: "/journal", label: "Journal", icon: NotebookPen },
      { to: "/mood", label: "Mood Tracker", icon: Brain },
      { to: "/checkin", label: "Check-in", icon: Sparkles },
    ],
  },
  { to: "/gamification", label: "Progress", icon: BarChart3, color: "yellow" },
  { to: "/settings", label: "Settings", icon: Settings2, color: "magenta" }
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground/90 backdrop-blur-sm/20 motion-safe:animate-float-soft z-30"
      aria-label="Primary"
    >
      <div className="h-16 flex items-center gap-2 px-4 border-b">
        <div className="size-9 rounded-xl bg-gradient-to-br from-red-500 via-yellow-500 to-purple-600 animate-shimmer bg-[length:200%_200%] shadow-bubbly motion-safe:animate-pulse-glow" aria-hidden />
        <div className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent motion-safe:animate-pop">BloomMind</div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            if (item.children) {
              return (
                <Accordion key={item.label} type="single" collapsible defaultValue={isActive ? "wellness" : undefined}>
                  <AccordionItem value="wellness" className="border-none">
                    <AccordionTrigger className="px-2 rounded-xl data-[state=open]:bg-gradient-to-r data-[state=open]:from-red-100 data-[state=open]:to-pink-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <Icon className="size-5 text-red-600" />
                        <span className="font-medium text-black">{item.label}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon as any;
                        const childActive = location.pathname.startsWith(child.to);
                        return (
                          <Tooltip key={child.to}>
                            <TooltipTrigger asChild>
                              <NavLink
                                to={child.to}
                                className={({ isActive }) =>
                                  cn(
                                    "flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all duration-300",
                                    "hover:bg-gradient-to-r hover:from-yellow-100 hover:to-red-100 hover:text-foreground",
                                    (isActive || childActive) && "bg-gradient-to-r from-yellow-200 to-red-200 text-red-800 font-semibold"
                                  )
                                }
                              >
                                <ChildIcon className={cn("size-4 transition-colors duration-300", (isActive || childActive) ? "text-red-600" : "text-yellow-600")} />
                                <span className="text-black">{child.label}</span>
                              </NavLink>
                            </TooltipTrigger>
                            <TooltipContent>{child.label}</TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            }

            const getColorClasses = (color: string, isActive: boolean) => {
              const colorMap = {
                blue: {
                  hover: "hover:bg-blue-100",
                  active: "bg-gradient-to-r from-blue-500 to-blue-600",
                  icon: isActive ? "text-white" : "text-blue-600",
                  iconHover: "group-hover:text-blue-700"
                },
                purple: {
                  hover: "hover:bg-purple-100",
                  active: "bg-gradient-to-r from-purple-500 to-pink-500",
                  icon: isActive ? "text-white" : "text-purple-600",
                  iconHover: "group-hover:text-purple-700"
                },
                yellow: {
                  hover: "hover:bg-yellow-100",
                  active: "bg-gradient-to-r from-yellow-500 to-orange-500",
                  icon: isActive ? "text-white" : "text-yellow-600",
                  iconHover: "group-hover:text-yellow-700"
                },
                magenta: {
                  hover: "hover:bg-pink-100",
                  active: "bg-gradient-to-r from-pink-500 to-purple-500",
                  icon: isActive ? "text-white" : "text-pink-600",
                  iconHover: "group-hover:text-pink-700"
                }
              };
              return colorMap[color as keyof typeof colorMap] || colorMap.blue;
            };
            
            const colors = getColorClasses(item.color || "blue", isActive);

            return (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 px-3 py-2 rounded-xl transition-all transform-gpu motion-reduce:transition-none duration-300",
                        colors.hover,
                        "hover:text-foreground hover:scale-[1.01] hover:translate-x-0.5",
                        isActive && `${colors.active} text-white shadow-lg`
                      )
                    }
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={cn("size-5 transition-colors duration-300", isActive ? "text-white" : `${colors.icon} ${colors.iconHover}`)}/>
                    <span className={cn("font-medium", isActive ? "text-white" : "text-black")}>{item.label}</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent>{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 transition-all duration-300">
          <Bot className="size-5 text-purple-600" />
          <div className="text-sm leading-tight">
            <div className="font-semibold text-purple-800">Gemini online</div>
            <div className="text-purple-600">Here to support you</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
