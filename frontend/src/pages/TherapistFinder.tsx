import { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Star,
  Video,
  Users,
  Phone,
  Mail,
  Award,
  GraduationCap,
  Globe,
  ArrowLeft,
  ChevronRight,
  UserCheck,
  Briefcase,
  Clock,
  MapPinned,
  Navigation,
  Loader2
} from 'lucide-react';

interface Therapist {
  id: string;
  name: string;
  specialty: string[];
  rating: number;
  reviews: number;
  experience?: number;
  gender?: string;
  availability: 'available' | 'busy' | 'limited';
  image?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  sessionType: ('in-person' | 'online')[];
  languages?: string[];
  fee?: {
    min: number;
    max: number;
  };
  verified: boolean;
  phone?: string;
  email?: string;
  bio?: string;
  education?: string;
  place_id?: string;
  photos?: string[];
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
  website?: string;
  distance?: number;
}

const SPECIALTIES = ['Anxiety', 'Depression', 'Stress Management', 'Family Therapy', 'Relationship Counseling', 
  'Trauma', 'Teen Counseling', 'Academic Stress', 'OCD', 'PTSD', 'Mindfulness', 'Burnout', 'Addiction Recovery'];

// Search keywords for finding therapists/counselors
const SEARCH_KEYWORDS = [
  'psychologist',
  'therapist',
  'counselor',
  'psychiatrist',
  'mental health clinic',
  'counseling center',
  'therapy center'
];

export default function TherapistFinder() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState<'list' | 'detail'>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [searchRadius, setSearchRadius] = useState<number>(5000); // 5km default
  
  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('');
  
  const detailMapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  // Load Google Maps Script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key not found in environment variables');
      setLocationError('Google Maps API key not configured');
      return;
    }

    // Check if script already loaded
    if ((window as any).google) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onerror = () => {
      setLocationError('Failed to load Google Maps API');
    };
  }, []);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setLocationError('');
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to New Delhi if location access denied
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(defaultLocation);
          setLocationError('Using default location (New Delhi). Enable location for personalized results.');
        }
      );
    } else {
      const defaultLocation = { lat: 28.6139, lng: 77.2090 };
      setUserLocation(defaultLocation);
      setLocationError('Geolocation not supported. Using default location.');
    }
  }, []);

  // Search for therapists using Google Places API
  useEffect(() => {
    if (!userLocation || !(window as any).google) return;

    const searchTherapists = async () => {
      setIsLoading(true);
      
      try {
        const google = (window as any).google;
        const map = new google.maps.Map(document.createElement('div'));
        const service = new google.maps.places.PlacesService(map);
        placesServiceRef.current = service;
        
        const allResults: Therapist[] = [];
        let completedSearches = 0;
        const totalSearches = SEARCH_KEYWORDS.length;

        // Search for each keyword
        for (const keyword of SEARCH_KEYWORDS) {
          const request = {
            location: userLocation,
            radius: searchRadius,
            keyword: keyword,
            type: 'health'
          };

          service.nearbySearch(request, (results: any, status: any) => {
            completedSearches++;
            
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              const mappedResults: Therapist[] = results.map((place: any) => {
                // Calculate distance
                const distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  place.geometry.location.lat(),
                  place.geometry.location.lng()
                );

                return {
                  id: place.place_id,
                  name: place.name,
                  specialty: extractSpecialties(place.types, place.name),
                  rating: place.rating || 4.0,
                  reviews: place.user_ratings_total || 0,
                  availability: determineAvailability(place.opening_hours),
                  location: {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    address: place.vicinity || place.formatted_address || ''
                  },
                  sessionType: ['in-person'], // Places API shows physical locations
                  verified: place.business_status === 'OPERATIONAL',
                  place_id: place.place_id,
                  photos: place.photos?.map((photo: any) => 
                    photo.getUrl({ maxWidth: 400, maxHeight: 400 })
                  ) || [],
                  opening_hours: place.opening_hours ? {
                    open_now: place.opening_hours.open_now || false,
                    weekday_text: place.opening_hours.weekday_text
                  } : undefined,
                  distance
                };
              });

              allResults.push(...mappedResults);
            }

            // When all searches complete
            if (completedSearches === totalSearches) {
              // Remove duplicates and sort by distance
              const uniqueResults = Array.from(
                new Map(allResults.map(item => [item.id, item])).values()
              ).sort((a, b) => (a.distance || 0) - (b.distance || 0));

              setTherapists(uniqueResults);
              setFilteredTherapists(uniqueResults);
              setIsLoading(false);
            }
          });
        }
      } catch (error) {
        console.error('Error searching therapists:', error);
        setIsLoading(false);
      }
    };

    searchTherapists();
    setTimeout(() => setIsLoaded(true), 100);
  }, [userLocation, searchRadius]);

  // Helper function to calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Helper to extract specialties
  const extractSpecialties = (_types: string[], name: string): string[] => {
    const specialties = [];
    const nameWords = name.toLowerCase();
    
    if (nameWords.includes('psychiatr')) specialties.push('Psychiatry');
    if (nameWords.includes('psycholog')) specialties.push('Psychology');
    if (nameWords.includes('counsel')) specialties.push('Counseling');
    if (nameWords.includes('therapy') || nameWords.includes('therapist')) specialties.push('Therapy');
    if (nameWords.includes('child') || nameWords.includes('teen')) specialties.push('Teen Counseling');
    if (nameWords.includes('family')) specialties.push('Family Therapy');
    if (nameWords.includes('mental health')) specialties.push('Mental Health');
    
    if (specialties.length === 0) specialties.push('General Counseling');
    return specialties;
  };

  // Helper to determine availability
  const determineAvailability = (opening_hours: any): 'available' | 'busy' | 'limited' => {
    if (!opening_hours) return 'limited';
    return opening_hours.open_now ? 'available' : 'limited';
  };

  // Initialize Google Map for Detail Page Only
  useEffect(() => {
    if (!detailMapRef.current || currentPage !== 'detail' || !selectedTherapist) return;

    // Initialize map centered on selected therapist
    const map = new (window as any).google.maps.Map(detailMapRef.current, {
      center: selectedTherapist.location,
      zoom: 15,
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

    // Add single marker for selected therapist
    const marker = new (window as any).google.maps.Marker({
      position: selectedTherapist.location,
      map: map,
      title: selectedTherapist.name,
      animation: (window as any).google.maps.Animation.DROP,
      icon: {
        url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50"><path fill="${selectedTherapist.availability === 'available' ? '%2310b981' : selectedTherapist.availability === 'limited' ? '%23f59e0b' : '%23ef4444'}" d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30c0-11-9-20-20-20z"/><circle cx="20" cy="20" r="8" fill="white"/></svg>`,
        scaledSize: new (window as any).google.maps.Size(40, 50),
      },
    });

    markerRef.current = marker;
  }, [currentPage, selectedTherapist]);

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

  const handleViewDetails = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setCurrentPage('detail');
    googleMapRef.current = null; // Reset map to reinitialize
  };

  const handleBackToList = () => {
    setCurrentPage('list');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-cyan-300/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-emerald-300/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* PAGE 1: LIST VIEW */}
      <div
        className={`relative transition-all duration-700 ease-in-out ${
          currentPage === 'list'
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-full absolute inset-0 pointer-events-none'
        }`}
      >
        <main className="relative z-10 p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className={`mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-blue-200/50 hover:shadow-xl transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                <MapPinned className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Find Your Therapist
                </p>
                <p className="text-xs text-gray-600">Mental health professionals near you</p>
              </div>
            </div>

            {userLocation && (
              <div className="inline-flex items-center gap-2 bg-emerald-50 backdrop-blur-xl rounded-full px-4 py-2 shadow-md border border-emerald-200/50">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">
                  Location enabled
                </span>
              </div>
            )}

            {locationError && (
              <div className="inline-flex items-center gap-2 bg-amber-50 rounded-full px-4 py-2 shadow-md border border-amber-200/50">
                <span className="text-xs font-medium text-amber-700">{locationError}</span>
              </div>
            )}
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Discover Mental Health Professionals
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Connect with verified mental health clinics, therapists, and counselors in your area using real-time Google Maps data.
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

            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="px-4 py-3 rounded-2xl border-2 border-blue-200 bg-white/80 backdrop-blur-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 font-medium"
            >
              <option value="2000">Within 2km</option>
              <option value="5000">Within 5km</option>
              <option value="10000">Within 10km</option>
              <option value="20000">Within 20km</option>
            </select>

            <div className="ml-auto flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <span className="text-sm font-semibold text-gray-700">
                {filteredTherapists.length} location{filteredTherapists.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Main Content: Therapist Cards */}
        <div className={`transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Therapist Cards Section */}
          <div className="space-y-6 max-w-5xl mx-auto">
            {isLoading ? (
              // Enhanced Loading State
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 text-center shadow-lg border border-blue-200/50">
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Searching for Mental Health Professionals
                  </h3>
                  <p className="text-gray-600">Finding therapists, counselors, and mental health clinics near you...</p>
                  <div className="mt-6 flex justify-center gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="flex gap-2 mt-3">
                          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTherapists.length === 0 ? (
              // Empty State
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center shadow-xl border border-gray-200/50">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center text-6xl mx-auto mb-6 shadow-lg">
                  �
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">
                  No Mental Health Professionals Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No results in your area. Try expanding your search radius or clearing filters.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={clearFilters}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setSearchRadius(20000)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Expand Radius to 20km
                  </button>
                </div>
              </div>
            ) : (
              // Therapist Cards
              filteredTherapists.map((therapist, index) => (
                <div
                  key={therapist.id}
                  onClick={() => handleViewDetails(therapist)}
                  className="group bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border-2 border-gray-200/50 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2"
                  style={{
                    animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="flex gap-6">
                    {/* Avatar / Photo */}
                    <div className="flex-shrink-0">
                      {therapist.photos && therapist.photos.length > 0 ? (
                        <img
                          src={therapist.photos[0]}
                          alt={therapist.name}
                          className="w-24 h-24 rounded-3xl object-cover shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                          <Users className="w-12 h-12 text-white" />
                        </div>
                      )}
                      {therapist.verified && (
                        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <UserCheck className="w-4 h-4" />
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

                      {/* Rating & Distance */}
                      <div className="flex items-center gap-4 mb-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-gray-800">{therapist.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({therapist.reviews} reviews)</span>
                        </div>
                        {therapist.distance && (
                          <div className="flex items-center gap-1 text-sm text-blue-600 font-semibold">
                            <Navigation className="w-4 h-4" />
                            <span>{therapist.distance.toFixed(1)} km away</span>
                          </div>
                        )}
                        {therapist.opening_hours?.open_now && (
                          <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                            Open Now
                          </div>
                        )}
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

                      {/* Session Types & Additional Info */}
                      <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>In-person visits</span>
                        </div>
                        {therapist.languages && therapist.languages.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span>{therapist.languages.join(', ')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="capitalize">{therapist.availability}</span>
                        </div>
                      </div>

                      {/* Footer: Action Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <div className="text-sm text-gray-600 font-medium">Google Places Listing</div>
                          <div className="text-lg font-bold text-gray-800">
                            Click to view details
                          </div>
                        </div>
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2">
                          View Details
                          <ChevronRight className="w-5 h-5" />
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
      </div>

      {/* PAGE 2: DETAIL VIEW */}
      <div
        className={`relative transition-all duration-700 ease-in-out ${
          currentPage === 'detail'
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'
        }`}
      >
        {selectedTherapist && (
          <div className="min-h-screen">
            {/* Back Button Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
              <div className="container mx-auto px-6 py-4 max-w-[1400px]">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-all font-semibold group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Back to List
                </button>
              </div>
            </div>

            <div className="container mx-auto px-6 py-8 max-w-[1400px]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile & Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Profile Card */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100">
                    <div className="flex items-start gap-6 mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Users className="w-12 h-12 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-4xl font-bold text-gray-800">{selectedTherapist.name}</h1>
                          {selectedTherapist.verified && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                              <UserCheck className="w-4 h-4" />
                              <span className="text-xs font-semibold">Verified</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            <span className="font-medium">{selectedTherapist.experience} years experience</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 rounded-2xl w-fit">
                          <Star className="w-5 h-5 text-white fill-white" />
                          <span className="text-xl font-bold text-white">{selectedTherapist.rating}</span>
                          <span className="text-sm text-white/90">({selectedTherapist.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">About</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedTherapist.bio}</p>
                    </div>

                    {/* Education */}
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-2xl mb-6">
                      <GraduationCap className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">Education</h4>
                        <p className="text-gray-600">{selectedTherapist.education}</p>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        Specializations
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedTherapist.specialty.map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-medium rounded-xl"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Session Types */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">Session Options</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedTherapist.sessionType.includes('online') && (
                          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl">
                            <Video className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-700">Online Sessions</span>
                          </div>
                        )}
                        {selectedTherapist.sessionType.includes('in-person') && (
                          <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 rounded-xl">
                            <Users className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-purple-700">In-Person Sessions</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Languages */}
                    {selectedTherapist.languages && selectedTherapist.languages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-teal-600" />
                          Languages
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {selectedTherapist.languages.map((lang, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Map Card */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      Location
                    </h3>
                    <div className="mb-4">
                      <p className="text-gray-600">{selectedTherapist.location.address}</p>
                    </div>
                    <div ref={detailMapRef} className="w-full h-96 rounded-2xl overflow-hidden shadow-lg"></div>
                  </div>
                </div>

                {/* Right Column - Contact & Booking */}
                <div className="space-y-6">
                  {/* Action Card */}
                  <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl p-6 shadow-xl text-white sticky top-24">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">Location Information</p>
                        <p className="text-2xl font-bold">Real-time Data</p>
                      </div>
                    </div>
                    {selectedTherapist.website && (
                      <a
                        href={selectedTherapist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 mb-3"
                      >
                        <Globe className="w-5 h-5" />
                        Visit Website
                      </a>
                    )}
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedTherapist.location.lat},${selectedTherapist.location.lng}&query_place_id=${selectedTherapist.place_id}`, '_blank')}
                      className="w-full py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-5 h-5" />
                      Get Directions
                    </button>
                  </div>

                  {/* Contact Card */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <a
                        href={`tel:${selectedTherapist.phone}`}
                        className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all group"
                      >
                        <div className="p-2 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-semibold text-gray-800">{selectedTherapist.phone}</p>
                        </div>
                      </a>
                      <a
                        href={`mailto:${selectedTherapist.email}`}
                        className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all group"
                      >
                        <div className="p-2 bg-purple-500 rounded-xl group-hover:scale-110 transition-transform">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-semibold text-gray-800">{selectedTherapist.email}</p>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Award className="w-5 h-5" />
                          <span className="font-medium">Experience</span>
                        </div>
                        <span className="font-bold text-gray-800">{selectedTherapist.experience} years</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Star className="w-5 h-5" />
                          <span className="font-medium">Reviews</span>
                        </div>
                        <span className="font-bold text-gray-800">{selectedTherapist.reviews}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-5 h-5" />
                          <span className="font-medium">Availability</span>
                        </div>
                        <span className={`font-bold capitalize ${
                          selectedTherapist.availability === 'available' ? 'text-green-600' :
                          selectedTherapist.availability === 'limited' ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {selectedTherapist.availability}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
