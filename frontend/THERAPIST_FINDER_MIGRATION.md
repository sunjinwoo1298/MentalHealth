# Therapist Finder - Two-Page System Migration Guide

## ✅ COMPLETED
- [x] Added lucide-react icon imports

## 🔄 TODO - Apply These Changes

### 1. Update Therapist Interface (Line ~7)
Add these fields after `verified: boolean;`:
```typescript
  phone: string;
  email: string;
  bio: string;
  education: string;
```

### 2. Add State for Page Navigation (Line ~161)
After `const [isLoaded, setIsLoaded] = useState(false);` add:
```typescript
  const [currentPage, setCurrentPage] = useState<'list' | 'detail'>('list');
```

### 3. Simplify Map Refs (Line ~172)
Replace:
```typescript
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
```
With:
```typescript
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
```

### 4. Update Mock Data - Add Contact Info
For each therapist in `MOCK_THERAPISTS`, add after `verified: true`:

**Dr. Priya Sharma:**
```typescript
    phone: '+91 98765 43210',
    email: 'dr.priya@therapy.in',
    bio: 'Specialized in cognitive behavioral therapy with a focus on young adults facing academic and career pressures.',
    education: 'PhD in Clinical Psychology, AIIMS New Delhi'
```

**Dr. Rajesh Kumar:**
```typescript
    phone: '+91 98765 43211',
    email: 'dr.rajesh@therapy.in',
    bio: 'Expert in family dynamics and relationship issues with over a decade of experience.',
    education: 'MD Psychiatry, PGI Chandigarh'
```

**Dr. Ananya Menon:**
```typescript
    phone: '+91 98765 43212',
    email: 'dr.ananya@therapy.in',
    bio: 'Passionate about helping teenagers navigate academic pressures and build healthy self-esteem.',
    education: 'MSc Clinical Psychology, Delhi University'
```

**Dr. Vikram Singh:**
```typescript
    phone: '+91 98765 43213',
    email: 'dr.vikram@therapy.in',
    bio: 'Senior psychologist specializing in trauma recovery and anxiety disorders.',
    education: 'PhD Clinical Psychology, NIMHANS Bangalore'
```

**Dr. Meera Iyer:**
```typescript
    phone: '+91 98765 43214',
    email: 'dr.meera@therapy.in',
    bio: 'Integrating traditional mindfulness practices with modern therapeutic techniques.',
    education: 'MSc Psychology, Mumbai University'
```

**Dr. Arjun Patel:**
```typescript
    phone: '+91 98765 43215',
    email: 'dr.arjun@therapy.in',
    bio: 'Compassionate approach to addiction recovery with proven track record.',
    education: 'MD Psychiatry, KGMU Lucknow'
```

### 5. Remove/Comment Out Full Map Initialization (Lines ~177-253)
The current map initialization shows ALL therapists. We'll replace this with detail-page-only map.

Comment out or remove the entire `useEffect` block that initializes the map.

### 6. Add New Map Initialization for Detail Page Only
Add this NEW useEffect AFTER the animation trigger:

```typescript
  // Initialize Google Map for detail page only
  useEffect(() => {
    if (currentPage === 'detail' && selectedTherapist && mapRef.current) {
      if (!googleMapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: selectedTherapist.location,
          zoom: 15,
          styles: [
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e0f2fe' }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f7faff' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] }
          ]
        });

        googleMapRef.current = map;

        const marker = new google.maps.Marker({
          position: selectedTherapist.location,
          map: map,
          title: selectedTherapist.name,
          animation: google.maps.Animation.DROP
        });

        markerRef.current = marker;
      }
    }
  }, [currentPage, selectedTherapist]);
```

### 7. Remove updateMarkers Function
Delete the entire `updateMarkers` function (~252-288) since we don't need multiple markers anymore.

### 8. Update handleTherapistClick
Replace the `handleTherapistClick` function (~308-312) with:

```typescript
  const handleViewDetails = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setCurrentPage('detail');
    googleMapRef.current = null; // Reset map to reinitialize
    markerRef.current = null;
  };

  const handleBackToList = () => {
    setCurrentPage('list');
  };
```

### 9. Replace Emoji Icons with Lucide Icons

In the header section (~323), replace:
```typescript
<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
  <span className="text-2xl">🗺️</span>
</div>
```
With:
```typescript
<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
  <MapPinned className="w-6 h-6 text-white" />
</div>
```

In the search bar (~342), add Search icon:
```typescript
<div className="flex-1 relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <input
    type="text"
    placeholder="Search by name, specialty, or location..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-12 pr-6 py-4 rounded-2xl ..." // Add pl-12 for icon space
  />
</div>
```

In filters section (~357), add Filter icon:
```typescript
<div className="flex flex-wrap gap-3">
  <div className="flex items-center gap-2 text-purple-600">
    <Filter className="w-5 h-5" />
    <span className="font-semibold">Filters:</span>
  </div>
  {/* rest of filters */}
</div>
```

Clear filters button (~391), update:
```typescript
<button
  onClick={clearFilters}
  className="px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl font-semibold text-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
>
  <X className="w-5 h-5" />
  Clear Filters
</button>
```

Empty state (~424), replace emoji:
```typescript
<div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
  <Users className="w-12 h-12 text-gray-400" />
</div>
```

### 10. Wrap List View and Add Detail Page

Find the current `<main className="relative z-10 p-6...">` tag (~319).

Replace the ENTIRE main section with:

```typescript
      {/* PAGE 1: LIST VIEW */}
      <div
        className={`relative transition-all duration-700 ease-in-out ${
          currentPage === 'list'
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-full absolute inset-0 pointer-events-none'
        }`}
      >
        <main className="relative z-10 p-6 max-w-[1400px] mx-auto">
          {/* ALL EXISTING CONTENT STAYS HERE */}
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

            {/* Detail content - see DETAIL_PAGE_TEMPLATE.md */}
          </div>
        )}
      </div>
```

### 11. Update Therapist Cards

In the card rendering section (~443), replace:

The avatar section:
```typescript
<div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center text-6xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
  {therapist.image}
</div>
```
With:
```typescript
<div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
  <Users className="w-8 h-8 text-white" />
</div>
```

The verified badge:
```typescript
{therapist.verified && (
  <UserCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
)}
```

Update ratings star:
```typescript
<div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 rounded-full">
  <Star className="w-4 h-4 text-white fill-white" />
  <span className="text-sm font-bold text-white">{therapist.rating}</span>
</div>
```

Replace session type emojis (~506):
```typescript
{therapist.sessionType.includes('online') && (
  <div className="flex items-center gap-1">
    <Video className="w-4 h-4 text-blue-500" />
    <span>Online</span>
  </div>
)}
{therapist.sessionType.includes('in-person') && (
  <div className="flex items-center gap-1">
    <Users className="w-4 h-4 text-purple-500" />
    <span>In-Person</span>
  </div>
)}
```

Language icon (~512):
```typescript
<div className="flex items-center gap-1 ml-auto">
  <Globe className="w-4 h-4 text-teal-500" />
  <span>{therapist.languages.length} langs</span>
</div>
```

Update "Book Session" button to "View Details":
```typescript
<button 
  onClick={() => handleViewDetails(therapist)}
  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 group-hover:gap-3"
>
  View
  <ChevronRight className="w-4 h-4" />
</button>
```

### 12. Remove Map from List View

Remove or comment out the entire map section (~400-434) that shows the map on the left side with markers.

## 📁 Detail Page Template

Create a new file `DETAIL_PAGE_TEMPLATE.md` with the complete detail page JSX to insert after the back button header.

## 🎯 Final Steps

1. Test transitions between list and detail views
2. Verify all icons display correctly (no emojis)
3. Test map loading on detail page
4. Verify back navigation works
5. Test responsive layout on mobile

## 🚀 Expected Result

- **Page 1 (List)**: Grid of therapist cards with filters, no map, proper icons
- **Page 2 (Detail)**: Complete therapist profile with bio, education, contact, single map marker
- **Smooth transitions**: 700ms ease-in-out slide animations between pages
- **No emojis**: All UI elements use lucide-react icons
