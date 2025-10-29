import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';

export default function TherapistFinder() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white/80 p-6 shadow-bubbly">
        <Card className="rounded-2xl bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle>Therapist Finder (Beta)</CardTitle>
            <CardDescription>Search therapists near you and book a consultation. Map & filters coming soon.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[320px] rounded-xl bg-gradient-to-br from-gray-50 via-white to-gray-100 border-dashed border-2 border-gray-200 flex items-center justify-center">
              <div className="text-center p-6">
                <h3 className="text-xl font-semibold mb-2">Map integration coming shortly</h3>
                <p className="text-sm text-muted-foreground mb-4">We will show therapists near you using Google Maps. Meanwhile, explore and get ready to filter by speciality.</p>
                <NavLink to="/dashboard">
                  <Button className="bg-rose-500 text-white">Back to Dashboard</Button>
                </NavLink>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
