import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowRight, CheckCircle2, Gift, MessageCircle, Target, LineChart, BadgeCheck } from "lucide-react";
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
  const [exampleFromServer, setExampleFromServer] = useState("");
  const fireConfetti = useConfetti();

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
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-white/70 backdrop-blur p-6 md:p-10 shadow-bubbly">
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

      {/* Quick access */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="rounded-2xl bg-white/80 border-crimson/50 hover:shadow-bubbly transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <MessageCircle className="text-red-500" /> Quick Chat
            </CardTitle>
            <CardDescription>Open a supportive dialogue now.</CardDescription>
          </CardHeader>
          <CardContent>
            <NavLink to="/chat">
              <Button variant="joy" className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">Start chatting</Button>
            </NavLink>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/80 border-golden/50 hover:shadow-bubbly transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Target className="text-yellow-600" /> Goals
            </CardTitle>
            <CardDescription>Friendly nudges keep habits fun.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">3 active</div>
              <div className="text-muted-foreground">Daily, weekly, monthly</div>
            </div>
            <BadgeCheck className="size-10 text-yellow-500" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/80 border-azure/50 hover:shadow-bubbly transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <LineChart className="text-blue-600" /> Recent Progress
            </CardTitle>
            <CardDescription>Small wins add up quickly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-red-500" /> Completed 2 tasks today
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Rewards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl bg-white/80 border-golden/50">
          <CardHeader>
            <CardTitle>Stickers & Badges</CardTitle>
            <CardDescription>Earn playful rewards for consistency.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {[
              "🌈", "🌟", "💎", "💖", "🧘", "🌿", "☀️", "🌸",
            ].map((s, i) => (
              <span key={i} className="text-2xl p-2 rounded-xl bg-secondary">{s}</span>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-white/80 border-joy-magenta/30 lg:col-span-2">
          <CardHeader>
            <CardTitle>Emotional Safety</CardTitle>
            <CardDescription>Gentle tone, content warnings, and supportive defaults.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Soothing visuals and rounded corners reduce tension</li>
              <li>Clear, friendly language with opt-in challenges</li>
              <li>Accessible colors, focus rings, and reduced-motion support</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Hidden server message to keep example parity */}
      <p className="sr-only">{exampleFromServer}</p>
    </div>
  );
}
