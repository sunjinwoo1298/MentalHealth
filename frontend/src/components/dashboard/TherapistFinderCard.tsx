import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, HeartHandshake } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function TherapistFinderCard() {
  return (
    <Card className="rounded-2xl overflow-hidden relative border-0 transform-gpu hover:scale-[1.02] transition-all duration-400 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 opacity-90 blur-sm -z-10" aria-hidden />
      <CardHeader className="relative z-10 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg animate-pulse">
            <MapPin className="text-white" />
          </div>
          <CardTitle className="text-white">Find Therapists Near You</CardTitle>
        </div>
        <CardDescription className="text-white/90 mt-2">Search verified therapists and get help faster. (Map integration coming soon)</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 text-white/95 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-white/30 flex items-center justify-center shadow-md">
            <HeartHandshake className="text-white/95" />
          </div>
          <div>
            <div className="font-semibold">Verified professionals</div>
            <div className="text-sm text-white/80">Filter by speciality, language & availability</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <NavLink to="/therapists">
            <Button className="bg-white text-rose-600 font-semibold hover:scale-105 transform transition" >
              Explore Nearby
            </Button>
          </NavLink>
          <div className="text-sm text-white/80">Beta • Free trial booking</div>
        </div>
      </CardContent>
      <div className="absolute right-6 bottom-4 opacity-90 z-0 pointer-events-none">
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="70" cy="70" r="70" fill="white" opacity="0.06" />
          <circle cx="70" cy="70" r="46" fill="white" opacity="0.04" />
        </svg>
      </div>
    </Card>
  );
}
