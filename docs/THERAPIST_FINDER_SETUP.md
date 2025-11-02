# Therapist Finder - Google Maps Integration Guide

## Overview
The Therapist Finder feature uses **real Google Places API data** to find mental health professionals near you. All mock data has been removed and replaced with live data from Google Maps.

## Features

### ✅ Real-Time Data
- **Google Places API Integration**: Fetches real mental health clinics, therapists, counselors, and psychiatrists
- **Live Location Data**: Uses your actual location or defaults to New Delhi
- **Distance Calculation**: Shows exact distance from your location
- **Real Ratings & Reviews**: Displays actual Google ratings and review counts
- **Business Photos**: Shows real photos from Google Places when available
- **Opening Hours**: Displays if locations are currently open

### ✅ Interactive Features
- **Dynamic Search Radius**: Choose 2km, 5km, 10km, or 20km radius
- **Filter by Specialty**: Filter by mental health specialty
- **Real-time Updates**: Results update as you change filters
- **Google Maps Integration**: Full interactive map on detail page
- **Get Directions**: Direct link to Google Maps navigation
- **Visit Website**: Links to business websites when available

### ✅ User Experience
- **Geolocation**: Automatically detects your location
- **Fallback Location**: Uses New Delhi if location access is denied
- **Loading States**: Beautiful loading animations while fetching data
- **Empty States**: Helpful messages when no results are found
- **Error Handling**: Graceful handling of API errors

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (Required)
   - **Places API** (Required)
   - **Geocoding API** (Optional)

4. Create an API key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the generated API key

5. **Important**: Restrict your API key for security:
   - Application restrictions: HTTP referrers
   - Add: `http://localhost:*/*` and your production domain
   - API restrictions: Select "Maps JavaScript API" and "Places API"

### 2. Configure Environment Variables

The API key is already configured in `.env.local`:

```bash
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDtRxRWy2LcZqw9_Z31o4liKz_Sw8Bk4bM
```

**Note**: If you need to use your own key:
1. Copy `.env.example` to `.env.local`
2. Replace the `VITE_GOOGLE_MAPS_API_KEY` value with your key
3. Restart the development server

### 3. Restart Development Server

```bash
cd frontend
npm run dev
```

## How It Works

### Search Algorithm
1. **Location Detection**: Gets user's GPS coordinates or uses default (New Delhi)
2. **Multiple Searches**: Searches for:
   - Psychologists
   - Therapists
   - Counselors
   - Psychiatrists
   - Mental health clinics
   - Counseling centers
   - Therapy centers
3. **Deduplication**: Removes duplicate results
4. **Sorting**: Sorts by distance from user
5. **Distance Calculation**: Uses Haversine formula for accurate distances

### Data Mapping
Each result includes:
- **Name**: Business name from Google Places
- **Location**: Latitude, longitude, and address
- **Rating**: Average Google rating (1-5 stars)
- **Reviews**: Total number of Google reviews
- **Distance**: Calculated distance from user
- **Availability**: Based on opening hours (open now / limited)
- **Photos**: Real business photos from Google
- **Opening Hours**: Current status and weekly schedule
- **Specialty**: Extracted from business name and type

## API Usage & Costs

### Google Places API Pricing
- **Places Nearby Search**: $32 per 1,000 requests
- **Free Tier**: $200 credit per month (~6,250 searches/month)
- **Optimization**: Results are cached per search radius change

### Rate Limiting
- The app searches 7 keywords per location request
- Total API calls: 7 per search
- Recommendation: Implement caching for production use

## Testing

### Test with Real Data
1. Allow location access when prompted
2. Results will show real mental health facilities near you
3. Try different search radii to see more results
4. Click on any result to see full details and map

### Test with Default Location (New Delhi)
1. Deny location access
2. App will use New Delhi as default location
3. You'll see real therapists and clinics in New Delhi area

## Troubleshooting

### "Failed to load Google Maps API"
- Check that your API key is correct in `.env.local`
- Verify that Maps JavaScript API and Places API are enabled
- Check browser console for specific error messages

### "No Therapists Found"
- Try increasing the search radius to 20km
- Clear filters and search again
- Check if location services are enabled
- Verify your internet connection

### "Using default location"
- Browser denied location access
- Enable location permissions in browser settings
- Or manually refresh the page and allow location

### API Key Restrictions
If you see authentication errors:
1. Check API key restrictions in Google Cloud Console
2. Add your domain to HTTP referrer restrictions
3. Ensure both Maps JavaScript API and Places API are selected

## Production Deployment

### Before Deploying:
1. ✅ Replace API key with production key
2. ✅ Add your production domain to API restrictions
3. ✅ Enable billing in Google Cloud Console
4. ✅ Set up API key rotation policy
5. ✅ Implement server-side caching to reduce costs
6. ✅ Add rate limiting on frontend
7. ✅ Monitor API usage in Google Cloud Console

### Recommended Optimizations:
- Cache search results for 1 hour
- Limit searches per user per day
- Use session storage for repeated searches
- Consider implementing a backend proxy for API calls
- Set up budget alerts in Google Cloud Console

## Security Notes

⚠️ **Important**:
- Never commit API keys to git (they're in `.env.local` which is gitignored)
- Always use environment variables for API keys
- Restrict API keys by domain and API
- Monitor API usage regularly
- Rotate keys periodically

## Future Enhancements

Possible improvements:
- Backend caching layer to reduce API costs
- User reviews and bookmarking
- Direct appointment booking integration
- Filter by insurance accepted
- Filter by session fees
- Multi-language support
- Accessibility ratings

## Support

For issues or questions:
1. Check Google Maps API documentation
2. Verify API key configuration
3. Check browser console for errors
4. Review Google Cloud Console for API usage

---

**Note**: The current API key in the repository is for development purposes. Replace it with your own key for production use.
