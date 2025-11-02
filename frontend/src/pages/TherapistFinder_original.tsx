import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  DollarSign, 
  Video, 
  Users, 
  Calendar,
  Phone,
  Mail,
  Award,
  GraduationCap,
  Globe,
  ArrowLeft,
  Filter,
  X,
  ChevronRight,
  UserCheck,
  Briefcase,
  Clock,
  MapPinned
} from 'lucide-react';

// Mock therapist data (replace with API call in production)
interface Therapist {
  id: string;
  name: string;
  specialty: string[];
  rating: number;
  reviews: number;
  experience: number;
  gender: string;
  availability: 'available' | 'busy' | 'limited';
  image: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  sessionType: ('in-person' | 'online')[];
  languages: string[];
  fee: {
    min: number;
    max: number;
  };
  verified: boolean;
}

const MOCK_THERAPISTS: Therapist[] = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    specialty: ['Anxiety', 'Depression', 'Stress Management'],
    rating: 4.8,
    reviews: 127,
    experience: 12,
    gender: 'Female',
    availability: 'available',
    image: '👩‍⚕️',
    location: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' },
    sessionType: ['in-person', 'online'],
    languages: ['English', 'Hindi'],
    fee: { min: 1500, max: 2500 },
    verified: true
  },
  {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    specialty: ['Family Therapy', 'Relationship Counseling', 'Trauma'],
    rating: 4.9,
    reviews: 203,
    experience: 15,
    gender: 'Male',
    availability: 'limited',
    image: '👨‍⚕️',
    location: { lat: 28.5355, lng: 77.3910, address: 'Noida Sector 18' },
    sessionType: ['in-person', 'online'],
    languages: ['English', 'Hindi', 'Punjabi'],
    fee: { min: 2000, max: 3000 },
    verified: true
  },
  {
    id: '3',
    name: 'Dr. Ananya Menon',
    specialty: ['Teen Counseling', 'Academic Stress', 'Self-esteem'],
    rating: 4.7,
    reviews: 89,
    experience: 8,
    gender: 'Female',
    availability: 'available',
    image: '👩‍⚕️',
    location: { lat: 28.4595, lng: 77.0266, address: 'Gurgaon, Cyber City' },
    sessionType: ['online'],
    languages: ['English', 'Hindi', 'Malayalam'],
    fee: { min: 1200, max: 2000 },
    verified: true
  },
  {
    id: '4',
    name: 'Dr. Vikram Singh',
    specialty: ['OCD', 'Anxiety Disorders', 'PTSD'],
    rating: 4.9,
    reviews: 156,
    experience: 18,
    gender: 'Male',
    availability: 'busy',
    image: '👨‍⚕️',
    location: { lat: 28.7041, lng: 77.1025, address: 'Rohini, North Delhi' },
    sessionType: ['in-person'],
    languages: ['English', 'Hindi'],
    fee: { min: 2500, max: 3500 },
    verified: true
  },
  {
    id: '5',
    name: 'Dr. Meera Iyer',
    specialty: ['Mindfulness', 'Work-Life Balance', 'Burnout'],
    rating: 4.6,
    reviews: 94,
    experience: 10,
    gender: 'Female',
    availability: 'available',
    image: '👩‍⚕️',
    location: { lat: 28.5494, lng: 77.2500, address: 'Lajpat Nagar, South Delhi' },
    sessionType: ['in-person', 'online'],
    languages: ['English', 'Hindi', 'Tamil'],
    fee: { min: 1800, max: 2800 },
    verified: true
  },
  {
    id: '6',
    name: 'Dr. Arjun Patel',
    specialty: ['Addiction Recovery', 'Substance Abuse', 'Behavioral Therapy'],
    rating: 4.8,
    reviews: 112,
    experience: 14,
    gender: 'Male',
    availability: 'limited',
    image: '👨‍⚕️',
    location: { lat: 28.4682, lng: 77.0700, address: 'DLF Phase 3, Gurgaon' },
    sessionType: ['in-person', 'online'],
    languages: ['English', 'Hindi', 'Gujarati'],
    fee: { min: 2200, max: 3200 },
    verified: true
  }
];

const SPECIALTIES = ['Anxiety', 'Depression', 'Stress Management', 'Family Therapy', 'Relationship Counseling', 
  'Trauma', 'Teen Counseling', 'Academic Stress', 'OCD', 'PTSD', 'Mindfulness', 'Burnout', 'Addiction Recovery'];

export default function TherapistFinder() {
  const [therapists, setTherapists] = useState<Therapist[]>(MOCK_THERAPISTS);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>(MOCK_THERAPISTS);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Trigger animations on mount
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map centered on Delhi
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 28.6139, lng: 77.2090 },
      zoom: 11,
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#e0f2fe' }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f7faff' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }]
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#eeeeee' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#d4f1f4' }]
        }
      ],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    googleMapRef.current = map;

    // Add search box
    const input = document.getElementById('map-search') as HTMLInputElement;
    if (input) {
      const searchBox = new google.maps.places.SearchBox(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (!places || places.length === 0) return;

        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
          if (!place.geometry || !place.geometry.location) return;
          bounds.extend(place.geometry.location);
        });
        map.fitBounds(bounds);
      });
    }

    updateMarkers(filteredTherapists);
  }, []);

  // Update markers when filtered therapists change
  useEffect(() => {
    updateMarkers(filteredTherapists);
  }, [filteredTherapists]);

  const updateMarkers = (therapistsToShow: Therapist[]) => {
    if (!googleMapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    const bounds = new google.maps.LatLngBounds();
    
    therapistsToShow.forEach((therapist) => {
      const marker = new google.maps.Marker({
        position: therapist.location,
        map: googleMapRef.current!,
        title: therapist.name,
        animation: google.maps.Animation.DROP,
        icon: {
          url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50"><path fill="${therapist.availability === 'available' ? '%2310b981' : therapist.availability === 'limited' ? '%23f59e0b' : '%23ef4444'}" d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30c0-11-9-20-20-20z"/><circle cx="20" cy="20" r="8" fill="white"/></svg>`,
          scaledSize: new google.maps.Size(40, 50),
        },
      });

      marker.addListener('click', () => {
        setSelectedTherapist(therapist);
        googleMapRef.current?.panTo(therapist.location);
        googleMapRef.current?.setZoom(14);
      });

      markersRef.current.push(marker);
      bounds.extend(therapist.location);
    });

    // Fit map to show all markers
    if (therapistsToShow.length > 0) {
      googleMapRef.current.fitBounds(bounds);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = therapists;

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSpecialty) {
      filtered = filtered.filter(t => t.specialty.includes(selectedSpecialty));
    }

    if (selectedGender) {
      filtered = filtered.filter(t => t.gender === selectedGender);
    }

    if (selectedSessionType) {
      filtered = filtered.filter(t => t.sessionType.includes(selectedSessionType as any));
    }

    if (selectedAvailability) {
      filtered = filtered.filter(t => t.availability === selectedAvailability);
    }

    setIsLoading(true);
    setTimeout(() => {
      setFilteredTherapists(filtered);
      setIsLoading(false);
    }, 300);
  }, [searchQuery, selectedSpecialty, selectedGender, selectedSessionType, selectedAvailability, therapists]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('');
    setSelectedGender('');
    setSelectedSessionType('');
    setSelectedAvailability('');
  };

  const handleTherapistClick = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    googleMapRef.current?.panTo(therapist.location);
    googleMapRef.current?.setZoom(14);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-cyan-300/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-emerald-300/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className={`mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-blue-200/50 mb-4 hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-2xl">🗺️</span>
            </div>
            <div>
              <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Find Your Therapist
              </p>
              <p className="text-xs text-gray-600">Verified mental health professionals near you</p>
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Discover the Right Therapist
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Connect with verified mental health professionals in your area. Filter by specialty, availability, and preferences.
          </p>
        </div>

        {/* Search Bar */}
        <div className={`mb-6 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, specialty, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-lg"
                />
              </div>
              {(searchQuery || selectedSpecialty || selectedGender || selectedSessionType || selectedAvailability) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl font-semibold text-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className={`mb-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm hover:border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 font-medium"
            >
              <option value="">All Specialties</option>
              {SPECIALTIES.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-pink-200 bg-white/80 backdrop-blur-sm hover:border-pink-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all duration-300 font-medium"
            >
              <option value="">Any Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <select
              value={selectedSessionType}
              onChange={(e) => setSelectedSessionType(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-teal-200 bg-white/80 backdrop-blur-sm hover:border-teal-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 font-medium"
            >
              <option value="">All Session Types</option>
              <option value="online">Online</option>
              <option value="in-person">In-Person</option>
            </select>

            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="px-4 py-3 rounded-2xl border-2 border-emerald-200 bg-white/80 backdrop-blur-sm hover:border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 font-medium"
            >
              <option value="">Any Availability</option>
              <option value="available">Available</option>
              <option value="limited">Limited</option>
            </select>

            <div className="ml-auto flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <span className="text-sm font-semibold text-gray-700">
                {filteredTherapists.length} therapist{filteredTherapists.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Main Content: Map + Results */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          {/* Map Section */}
          <div className="lg:sticky lg:top-6 h-[600px] lg:h-[calc(100vh-12rem)]">
            <div className="h-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <input
                  id="map-search"
                  type="text"
                  placeholder="Search locations on map..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
                />
              </div>
              <div ref={mapRef} className="w-full h-[calc(100%-5rem)]" />
              
              {/* Map Legend */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="font-medium">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="font-medium">Limited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-medium">Busy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Therapist Cards Section */}
          <div className="space-y-6">
            {isLoading ? (
              // Skeleton Loader
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-2xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTherapists.length === 0 ? (
              // Empty State
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center shadow-lg border border-gray-200/50">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center text-6xl mx-auto mb-6">
                  😔
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Therapists Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              // Therapist Cards
              filteredTherapists.map((therapist, index) => (
                <div
                  key={therapist.id}
                  onClick={() => handleTherapistClick(therapist)}
                  className={`group bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border-2 hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 ${
                    selectedTherapist?.id === therapist.id 
                      ? 'border-blue-400 ring-4 ring-blue-100' 
                      : 'border-gray-200/50 hover:border-blue-300'
                  }`}
                  style={{
                    animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="flex gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center text-6xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        {therapist.image}
                      </div>
                      {therapist.verified && (
                        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <span>✓</span>
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                            {therapist.name}
                          </h3>
                          <p className="text-sm text-gray-600">{therapist.location.address}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          therapist.availability === 'available' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : therapist.availability === 'limited'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {therapist.availability === 'available' ? '● Available' : therapist.availability === 'limited' ? '● Limited' : '● Busy'}
                        </div>
                      </div>

                      {/* Rating & Experience */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-bold text-gray-800">{therapist.rating}</span>
                          <span className="text-sm text-gray-500">({therapist.reviews} reviews)</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">{therapist.experience}</span> years exp.
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {therapist.specialty.slice(0, 3).map((spec) => (
                          <span
                            key={spec}
                            className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* Session Types & Languages */}
                      <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>💻</span>
                          <span>{therapist.sessionType.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🗣️</span>
                          <span>{therapist.languages.join(', ')}</span>
                        </div>
                      </div>

                      {/* Footer: Fee & Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <div className="text-sm text-gray-600">Session Fee</div>
                          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ₹{therapist.fee.min} - ₹{therapist.fee.max}
                          </div>
                        </div>
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl">
                          Book Session
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

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
