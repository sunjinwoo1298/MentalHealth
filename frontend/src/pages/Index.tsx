import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowRight, CheckCircle2, Gift, MessageCircle, Target, LineChart } from "lucide-react";
import TherapistFinderCard from "@/components/dashboard/TherapistFinderCard";
import QuickMoodWidget from "@/components/dashboard/QuickMoodWidget";
import { useConfetti } from "../hooks/useConfetti";
import { AvatarGemini } from "../components/AvatarGemini";
import { NavLink } from "react-router-dom";

function WellnessIllustration() {
  return (
    <svg viewBox="0 0 400 220" className="w-full h-auto" role="img" aria-label="Calming wellness illustration">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="hsl(var(--joy-azure))" />
          <stop offset="100%" stopColor="hsl(var(--joy-magenta))" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="220" rx="24" fill="url(#g1)" opacity="0.45" />
      <g opacity="0.8">
        <circle cx="90" cy="110" r="40" fill="hsl(var(--joy-golden))" />
        <circle cx="160" cy="80" r="24" fill="hsl(var(--joy-crimson))" />
        <circle cx="210" cy="140" r="18" fill="hsl(var(--joy-pink))" />
        <rect x="250" y="80" width="110" height="70" rx="16" fill="white" opacity="0.9" />
        <path d="M260 120 q15 -20 30 0 t30 0 t30 0" stroke="hsl(var(--joy-azure))" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function Index() {
  const [exampleFromServer] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const fireConfetti = useConfetti();

  useEffect(() => {
    // Trigger animations after mount
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const response = await fetch("/api/demo");
  //       const data = (await response.json()) as DemoResponse;
  //       setExampleFromServer(data.message);
  //     } catch {
  //       // ignore
  //     }
  //   })();
  // }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 relative overflow-hidden pb-12">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-purple-300/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-cyan-300/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-rose-300/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 space-y-8">
      {/* Hero */}
      <section 
        className={`relative overflow-hidden rounded-3xl border border-purple-200/50 bg-white/80 backdrop-blur-xl p-6 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-1 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ animation: isLoaded ? 'slideInUp 0.8s ease-out forwards' : 'none' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <AvatarGemini  />
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Your playful mental wellness space
            </h1>
            <p className="text-muted-foreground max-w-prose">
              I’m your AI companion, here to support your mood, goals, and growth. Let’s take a mindful step today.
            </p>
            <div className="flex flex-wrap gap-3">
              <NavLink to="/chat">
                <Button variant="joy" className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Chat with Gemini
                  <ArrowRight className="ml-1" />
                </Button>
              </NavLink>
              <Button
                variant="secondary"
                className="rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={(e:any) => {
                  fireConfetti();
                  try {
                    (window as any).__spawnBlobs?.({ count: 10, palette: ["hsl(var(--joy-crimson))","hsl(var(--joy-azure))","hsl(var(--joy-golden))","hsl(var(--joy-magenta))"] });
                  } catch (err) {
                    // ignore
                  }
                  try {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    (window as any).__spawnRipple?.({ x: cx, y: cy });
                  } catch (err) {
                    // ignore
                  }
                }}
              >
                Celebrate win
                <Gift className="ml-2" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-joy-gradient opacity-30 blur-2xl" aria-hidden />
            <WellnessIllustration />
          </div>
        </div>
      </section>

      {/* Primary Action Cards - Full Width for Important Widgets */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ animationDelay: '0.2s', animation: isLoaded ? 'slideInUp 0.6s ease-out forwards' : 'none' }}
        >
          <QuickMoodWidget />
        </div>
        
        <div 
          className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ animationDelay: '0.3s', animation: isLoaded ? 'slideInUp 0.6s ease-out forwards' : 'none' }}
        >
          <TherapistFinderCard />
        </div>
      </section>

      {/* Secondary Action Cards - 3 Column Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className={`rounded-3xl bg-white/80 backdrop-blur-xl border border-purple-200/50 hover:border-purple-400/70 hover:shadow-2xl transition-all duration-500 shadow-xl hover:-translate-y-3 hover:scale-[1.02] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ animationDelay: '0.4s', animation: isLoaded ? 'slideInUp 0.6s ease-out forwards' : 'none' }}
        >
          <CardHeader className="space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl animate-pulse mx-auto">
              <MessageCircle className="text-white w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-500 bg-clip-text text-transparent text-center">
              Quick Chat
            </CardTitle>
            <CardDescription className="text-base font-medium text-purple-600/80 text-center">Open a supportive dialogue now.</CardDescription>
          </CardHeader>
          <CardContent>
            <NavLink to="/chat">
              <Button variant="joy" className="w-full rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold py-6 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Start chatting
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </NavLink>
          </CardContent>
        </Card>

        <Card 
          className={`rounded-3xl bg-white/80 backdrop-blur-xl border border-amber-200/50 hover:border-amber-400/70 hover:shadow-2xl transition-all duration-500 shadow-xl hover:-translate-y-3 hover:scale-[1.02] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ animationDelay: '0.5s', animation: isLoaded ? 'slideInUp 0.6s ease-out forwards' : 'none' }}
        >
          <CardHeader className="space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-xl animate-pulse mx-auto">
              <Target className="text-white w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent text-center">
              Goals
            </CardTitle>
            <CardDescription className="text-base font-medium text-amber-600/80 text-center">Friendly nudges keep habits fun.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-2">3</div>
              <div className="text-amber-600/80 font-semibold text-sm uppercase tracking-wide">Active Goals</div>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-full text-amber-700 text-xs font-semibold">Daily</span>
              <span className="px-3 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-full text-amber-700 text-xs font-semibold">Weekly</span>
              <span className="px-3 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-full text-amber-700 text-xs font-semibold">Monthly</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-200/50 hover:border-blue-400/70 hover:shadow-2xl transition-all duration-500 shadow-xl hover:-translate-y-3 hover:scale-[1.02] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ animationDelay: '0.6s', animation: isLoaded ? 'slideInUp 0.6s ease-out forwards' : 'none' }}
        >
          <CardHeader className="space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl animate-pulse mx-auto">
              <LineChart className="text-white w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 bg-clip-text text-transparent text-center">
              Recent Progress
            </CardTitle>
            <CardDescription className="text-base font-medium text-blue-600/80 text-center">Small wins add up quickly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                <CheckCircle2 className="text-blue-500 w-6 h-6 flex-shrink-0" />
                <span className="text-blue-700 font-semibold text-sm">2 tasks completed</span>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                <CheckCircle2 className="text-emerald-500 w-6 h-6 flex-shrink-0" />
                <span className="text-emerald-700 font-semibold text-sm">5 day streak</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Engagement & Safety Section */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Stickers - 2 columns on large screens */}
        <Card 
          className={`rounded-3xl bg-white/80 backdrop-blur-xl border border-pink-200/50 hover:border-pink-400/70 hover:shadow-2xl transition-all duration-500 shadow-xl lg:col-span-2 hover:-translate-y-3 hover:scale-[1.02] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ animationDelay: '0.7s', animation: isLoaded ? 'slideInUp 0.6s ease-out forwards' : 'none' }}
        >
          <CardHeader className="space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-xl animate-pulse mx-auto">
              <Gift className="text-white w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 bg-clip-text text-transparent text-center">
              Stickers & Badges
            </CardTitle>
            <CardDescription className="text-base font-medium text-pink-600/80 text-center">Earn playful rewards for consistency.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3 flex-wrap justify-center">
            {[
              "🌈", "🌟", "💎", "💖", "🧘", "🌿", "☀️", "🌸",
            ].map((s, i) => (
              <span 
                key={i} 
                className="text-4xl p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/50 shadow-lg hover:scale-125 hover:rotate-12 transition-all duration-300 cursor-pointer hover:shadow-2xl"
                style={{ animationDelay: `${0.9 + i * 0.05}s` }}
              >
                {s}
              </span>
            ))}
          </CardContent>
        </Card>

        {/* Emotional Safety - 3 columns on large screens */}
        <Card 
          className={`rounded-3xl bg-white/80 backdrop-blur-xl border border-emerald-200/50 hover:border-emerald-400/70 hover:shadow-2xl transition-all duration-500 shadow-xl lg:col-span-3 hover:-translate-y-3 hover:scale-[1.01] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ animationDelay: '0.8s', animation: isLoaded ? 'slideInUp 0.6s ease-out forwards' : 'none' }}
        >
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl animate-pulse flex-shrink-0">
                <CheckCircle2 className="text-white w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  Emotional Safety
                </CardTitle>
                <CardDescription className="text-base font-medium text-emerald-600/80">Gentle tone, content warnings, and supportive defaults.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center space-y-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  ✓
                </div>
                <span className="text-emerald-700 font-semibold text-sm leading-relaxed">Soothing visuals and rounded corners reduce tension</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  ✓
                </div>
                <span className="text-emerald-700 font-semibold text-sm leading-relaxed">Clear, friendly language with opt-in challenges</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  ✓
                </div>
                <span className="text-emerald-700 font-semibold text-sm leading-relaxed">Accessible colors, focus rings, and reduced-motion support</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Hidden server message to keep example parity */}
      <p className="sr-only">{exampleFromServer}</p>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
