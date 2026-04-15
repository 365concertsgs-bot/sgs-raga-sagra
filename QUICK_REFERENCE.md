# Quick Reference - Global Coordinates & Dynamic Logos

## For Developers

### Using the App Component with Custom Logos

```jsx
import App from './src/App';

// Default (Using provided URLs)
<App />

// Custom logos
<App 
  leftLogoUrl="https://your-domain.com/left-logo.png"
  rightLogoUrl="https://your-domain.com/right-logo.png"
/>

// One logo only
<App 
  leftLogoUrl="https://your-domain.com/logo.png"
/>

// No logos (pass empty strings)
<App 
  leftLogoUrl=""
  rightLogoUrl=""
/>
```

### Using Geospatial Utilities

```javascript
import {
  isValidCoordinate,
  haversineDistance,
  isWithinRadius,
  getHemisphere,
  normalizeLongitude,
  getBoundingBox
} from './src/geoUtilities';

// Validate a coordinate
const valid = isValidCoordinate(-25.2744, 133.7751); // Australia
console.log(valid); // true

// Calculate distance between two events
const distanceKm = haversineDistance(
  -25.2744, 133.7751,   // Sydney
  -33.8688, 151.2093    // Melbourne
);
console.log(distanceKm); // ~873 km

// Check if event is within search radius
const inRadius = isWithinRadius(
  -25.2744, 133.7751,   // Event location
  -25.3, 133.9,         // Search center
  50                    // 50 km radius
);
console.log(inRadius); // true/false

// Get hemisphere info
const hemisphere = getHemisphere(-25.2744, 133.7751);
console.log(hemisphere); // { vertical: 'Southern', horizontal: 'Eastern' }

// Get bounds for all events
const events = [{lat: -25, lng: 133}, {lat: 37, lng: -95}];
const bounds = getBoundingBox(events);
console.log(bounds);
// { minLat: -25, maxLat: 37, minLng: -95, maxLng: 133, centerLat: 6, centerLng: 19 }
```

---

## For Data Entry / Supabase Setup

### Required Columns in `events_365` Table

| Column Name | Type | Example | Notes |
|------------|------|---------|-------|
| `no` | int | 1, 2, 3 | Event number (1-365) |
| `latitude` | float | -25.2744 | Can be negative (South) |
| `longitude` | float | 133.7751 | Can be negative (West) |
| `link_for_audio_or_video` | text | https://vimeo.com/123456 | Vimeo/YouTube/audio URL |
| `raga_sagara_name_event` or `event_name` | text | "Event Name" | Event title |
| `continent` | text | "Australia" | Continent name |
| `city` | text | "Sydney" | City name |
| `country` | text | "Australia" | Country name |
| `venue` | text | "Opera House" | Venue/place |
| `date` | date | 2023-06-21 | Event date |
| `description` | text | "..." | Event description |
| `Healing_ragas` or `raga` | text | "Raga Name" | Raga/musical form |

### Optional Columns in `events365_media` Table

| Column Name | Type | Example | Notes |
|------------|------|---------|-------|
| `Event` | int | 1 | References event number |
| `URL` | text | https://... | Image URL |

### Coordinate Ranges (Global)

**Valid Latitude Range**: -90° to 90°
- -90° = South Pole
- 0° = Equator
- 90° = North Pole

**Valid Longitude Range**: -180° to 180°
- -180° = International Date Line (West)
- 0° = Prime Meridian (Greenwich)
- 180° = International Date Line (East)

### Example Regional Coordinates

```
NORTHERN HEMISPHERE (positive latitude)
├─ Asia: 20° to 50° N, 80° to 150° E
├─ Europe: 35° to 70° N, -10° to 50° E
├─ North America: 15° to 85° N, -170° to -50° W
└─ Africa North: 10° to 37° N, -20° to 55° E

SOUTHERN HEMISPHERE (negative latitude)
├─ Australia: -10° to -44° S, 113° to 154° E
├─ South America: -2° to -56° S, -35° to -82° W
├─ Africa South: -5° to -35° S, 12° to 40° E
└─ New Zealand: -34° to -47° S, 166° to 179° E

WESTERN HEMISPHERE (negative longitude)
├─ North America: -170° to -50° W
├─ Central America: -82° to -76° W
├─ South America: -35° to -82° W
└─ Pacific Islands: -170° to -110° W

EASTERN HEMISPHERE (positive longitude)
├─ Europe: 0° to 50° E
├─ Africa: -20° to 55° E
├─ Asia: 50° to 150° E
└─ Australia/Oceania: 113° to 180° E
```

### Media URL Examples

```javascript
// Vimeo links
https://vimeo.com/123456
https://vimeopro.com/user/video/123456

// YouTube links
https://youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ

// Spotify (converted to embed)
https://open.spotify.com/track/123456
→ becomes: https://open.spotify.com/embed/track/123456

// SoundCloud
https://soundcloud.com/user/track

// Direct audio files
https://example.com/audio.mp3
https://example.com/audio.wav
https://example.com/audio.ogg
https://example.com/audio.m4a
https://example.com/audio.aac
```

---

## For Administrators

### Deployment Checklist

- [ ] Source code updated and tested
- [ ] Supabase tables have correct column names
- [ ] Coordinates include proper signs (negative for S/W)
- [ ] All events have valid coordinates
- [ ] Vimeo/media URLs are publicly accessible
- [ ] Logo URLs are accessible and not CORS-blocked
- [ ] Environment variables configured
- [ ] Build passes without errors: `npm run build`
- [ ] Testing completed with real data
- [ ] Lighthouse audit scores acceptable

### Verifying Coordinate Data

**SQL Query to Check Coordinate Validity**:
```sql
SELECT 
  no,
  latitude,
  longitude,
  CASE 
    WHEN latitude IS NULL OR longitude IS NULL THEN 'Missing'
    WHEN latitude < -90 OR latitude > 90 THEN 'Invalid Latitude'
    WHEN longitude < -180 OR longitude > 180 THEN 'Invalid Longitude'
    ELSE 'Valid'
  END as coordinate_status
FROM events_365
WHERE coordinate_status != 'Valid'
ORDER BY no;
```

### Monitoring Performance

Key metrics to track:
- Time to fetch `events_365` table
- Time to fetch `events365_media` table
- Time to filter/render coordinates
- Time to load logos
- Time to load Vimeo players

Use browser DevTools → Performance tab for analysis.

---

## Common Issues & Solutions

### Issue: Southern Hemisphere Events Not Showing
**Solution**: Verify latitude values are negative (e.g., -25.2744)
```sql
SELECT * FROM events_365 WHERE latitude < 0;
```

### Issue: Western Hemisphere Events Not Showing
**Solution**: Verify longitude values are negative (e.g., -95.7129)
```sql
SELECT * FROM events_365 WHERE longitude < 0;
```

### Issue: Logos Not Loading
**Solution**: Test image URL in browser first
```javascript
// In browser console:
fetch('https://i.imgur.com/lPDE0zB.jpeg')
  .then(r => console.log('URL Valid:', r.status === 200))
  .catch(e => console.log('URL Invalid:', e))
```

### Issue: Vimeo Not Playing
**Solution**: Check URL format
```javascript
// Must be one of these formats:
- https://vimeo.com/VIDEO_ID
- https://vimeopro.com/user/video/VIDEO_ID

// Extract ID:
const videoId = url.match(/(?:vimeo\.com\/|\/video\/)(\d+)/)?.[1];
console.log('Vimeo ID:', videoId);
```

### Issue: Raga Not Displaying
**Solution**: Check column name matches one of these
```
- Healing_ragas
- healing_ragas  
- main_raga
- raga
- main_raga_name
```

---

## Color Reference

### UI Color Scheme
```
Primary: #ffd700 (Golden)
Background: #000000 (Black)
Text: #ffffff (White)
Accent: #00ff00 (Green) - for title
```

### CSS Variables (if needed in future)
```css
--primary: #ffd700;    /* Gold */
--bg: #000000;         /* Black */
--text: #ffffff;       /* White */
--accent: #00ff00;     /* Green */
```

---

## Support & Resources

### Documentation Files
- `IMPLEMENTATION_SUMMARY.md` - Overview of changes
- `GLOBAL_COORDINATES_UPDATE.md` - Detailed changelog
- `TESTING_GUIDE.md` - Testing procedures
- `geoUtilities.js` - Utility functions

### External Resources
- [Vimeo Embed API](https://developer.vimeo.com/player/sdk)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Globe.gl Documentation](https://vasturiano.github.io/globe.gl/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)

---

**Version**: 1.0  
**Last Updated**: April 2026  
**Status**: Production Ready
