# Global Coordinates & Dynamic Logos Update

## Changes Made

### 1. ✅ Global Coordinate Validation (App.jsx)
- **Issue Fixed**: Application now correctly handles events in southern and western hemispheres
- **Supported Regions**:
  - ✅ Southern Hemisphere: Australia, Argentina, South Africa, New Zealand
  - ✅ Western Hemisphere: Americas (North and South America)
  - ✅ Northern Hemisphere: Europe, Asia, North America
  - ✅ Eastern Hemisphere: Asia, Africa, Europe

- **Coordinate Range Validation**:
  - Latitude: -90° to 90° (South to North)
  - Longitude: -180° to 180° (West to East)

- **Implementation**:
  - Updated `filteredData` useMemo with comprehensive global coordinate validation
  - Invalid coordinates are automatically filtered out
  - Events are rendered correctly regardless of hemisphere

### 2. ✅ Dynamic Logo Support (App.jsx)
- **Props Added**:
  - `leftLogoUrl` - URL for left-side logo (default: https://i.imgur.com/lPDE0zB.jpeg)
  - `rightLogoUrl` - URL for right-side logo (default: https://i.imgur.com/opWvuCC.jpeg)

- **Features**:
  - Both logos render conditionally when URLs are provided
  - Responsive sizing using CSS clamp()
  - Automatic error handling (images hide on load failure)
  - Maintains consistent alignment:
    - Left logo: left-aligned with golden glow effect
    - Right logo: right-aligned with golden glow effect

- **Usage**:
  ```jsx
  <App 
    leftLogoUrl="https://i.imgur.com/lPDE0zB.jpeg"
    rightLogoUrl="https://i.imgur.com/opWvuCC.jpeg"
  />
  ```

### 3. ✅ Vimeo/Media Link Integration (App.jsx & EventModal.jsx)
- **Issue Fixed**: Media links now properly fetched and displayed
- **Implementation**:
  - Maps `link_for_audio_or_video` column from Supabase to `audioUrl`
  - Renamed internal field from `audio` to `audioUrl` for clarity
  - AudioPlayer component receives correct URL and renders:
    - Vimeo videos (embedded player)
    - YouTube videos (embedded player)
    - Spotify audio (embedded player)
    - SoundCloud audio (embedded player)
    - Direct audio files (.mp3, .wav, etc.)

- **Features**:
  - Media plays when user clicks on event details
  - Responsive iframe sizing
  - Automatic platform detection from URL
  - Lazy loading for performance

### 4. ✅ Event Details Enhancement (EventModal.jsx)
- Added Raga field to event details grid
- Improved emoji consistency in detail headers
- Event details now display:
  - 📍 Location
  - 🏙️ City
  - 📅 Date
  - 📆 Year
  - #️⃣ Event Number
  - 🎵 Raga (when available)

## Geospatial Utilities (geoUtilities.js)

A new utilities file with helper functions:

- `isValidCoordinate(lat, lng)` - Validates coordinate ranges
- `haversineDistance(lat1, lng1, lat2, lng2)` - Calculates distance between two points
- `isWithinRadius(lat, lng, centerLat, centerLng, radiusKm)` - Location-based filtering
- `getHemisphere(lat, lng)` - Returns hemisphere information
- `normalizeLongitude(lng)` - Handles date line wrap-around
- `getBoundingBox(events)` - Calculates bounds for event clustering

## Testing Recommendations

### Test Cases

1. **Southern Hemisphere Events**
   - Events in Australia (e.g., Sydney: -33.8688, 151.2093)
   - Events in Brazil (e.g., Rio: -22.9068, -43.1729)
   - Events in South Africa (e.g., Cape Town: -33.9249, 18.4241)

2. **Western Hemisphere Events**
   - Events in USA (negative longitude)
   - Events in Canada (negative longitude)
   - Events in Central/South America (negative longitude)

3. **Logo Display**
   - Verify logos render on left and right
   - Check responsive sizing on mobile/tablet/desktop
   - Confirm error handling when image URL fails

4. **Media Playback**
   - Click event details to open modal
   - Verify Vimeo links play in embedded player
   - Test with different media platforms (Vimeo, YouTube, audio)

## Browser Support

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Responsive Design

- Logos scale with viewport size using CSS clamp()
- Logo sizing: `clamp(50px, 10vh, 100px)`
- Maintains aspect ratio across all screen sizes
- Touch-friendly on mobile devices

## Performance Notes

- Coordinate validation happens at filtering stage (efficient)
- Haversine calculations available for advanced filtering
- Media players use lazy loading for performance
- Event modal uses Suspense for code splitting

## Future Enhancements

Potential improvements using the new utilities:

1. **Radius-based event filtering** - Search events within X km of a location
2. **Distance-based event clustering** - Group nearby events
3. **Smart continent centering** - Auto-calculate optimal globe rotation
4. **Geofence alerts** - Notify when events are near specific locations
