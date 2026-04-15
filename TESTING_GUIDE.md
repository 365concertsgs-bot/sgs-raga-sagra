# Testing Guide - Global Coordinates & Dynamic Logos

## Quick Start

### Verify Props Are Correctly Used
Check `main.jsx` where App component is mounted:

```jsx
<App 
  leftLogoUrl="https://i.imgur.com/lPDE0zB.jpeg"
  rightLogoUrl="https://i.imgur.com/opWvuCC.jpeg"
/>
```

---

## Test Cases

### 1. Global Coordinate Validation

#### Test 1.1: Southern Hemisphere Events
**Location**: Australia
**Expected**: Events at Australian coordinates should render on globe
- Sydney: lat: -33.8688, lng: 151.2093 ✓
- Melbourne: lat: -37.8136, lng: 144.9631 ✓
- Brisbane: lat: -27.4698, lng: 153.0251 ✓

**Steps**:
1. Open app
2. If you have events with negative latitude values, verify they appear on the globe
3. Click on Australian events
4. Check event details modal opens correctly

#### Test 1.2: Western Hemisphere Events
**Location**: South America
**Expected**: Events with negative longitude should render correctly
- São Paulo: lat: -23.5505, lng: -46.6333 ✓
- Buenos Aires: lat: -34.6037, lng: -58.3816 ✓
- Lima: lat: -12.0464, lng: -77.0428 ✓

**Steps**:
1. Open app
2. Verify events in Americas appear on globe
3. Test filtering by continent "South America"
4. Click events to verify details

#### Test 1.3: Both Negative Coordinates
**Location**: South Africa
**Expected**: Events with both negative coordinates render correctly
- Cape Town: lat: -33.9249, lng: 18.4241 (positive longitude) ✓
- Johannesburg: lat: -26.2023, lng: 28.0436 (positive longitude) ✓

**Steps**:
1. Filter by continent "Africa"
2. Verify South African events appear
3. Check coordinate display in network inspector

#### Test 1.4: Edge Cases
**Expected Behavior**:
- Event at Equator (lat: 0): Should display correctly ✓
- Event at Prime Meridian (lng: 0): Should display correctly ✓
- Event with exactly -90 (South Pole): Should filter correctly (if data exists) ✓
- Events with 180/-180 longitude wrap: Should handle date line correctly ✓

---

### 2. Dynamic Logos Display

#### Test 2.1: Left Logo Rendering
**Expected**: Left logo (imgur image) displays in top-left corner

**Steps**:
1. Open app
2. Look at top-left corner of screen
3. Verify logo image is visible
4. Verify it has golden glow effect
5. Hover over it - should have subtle shadow

**Visual Checks**:
```
┌─────────────────────────────────────────────────────────────────┐
│ [🖼️ LEFT]             Ragini Ragini Atlas             [RIGHT 🖼️] │
│                                                                 │
│                         [GLOBE]                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Test 2.2: Right Logo Rendering
**Expected**: Right logo (imgur image) displays in top-right corner

**Steps**:
1. Open app
2. Look at top-right corner
3. Verify logo image is visible
4. Verify alignment (right-aligned)
5. Check for golden glow effect

#### Test 2.3: Logo Responsiveness
Test on different screen sizes:

**Desktop (1920x1080)**:
- Logos should be approximately 50-100px tall
- Maintain spacing from edge

**Tablet (768px)**:
- Logos should scale down proportionally
- Verify using Chrome DevTools: Inspect Element → Toggle Device Toolbar
- Check "Responsive" mode

**Mobile (375px)**:
- Logos should still be visible
- May stack closer to title
- Should not overlap with filters

**Steps**:
1. Open DevTools (F12)
2. Click "Toggle device toolbar"
3. Select different device presets
4. Verify logos scale appropriately
5. Check no overlap occurs

#### Test 2.4: Logo Error Handling
**Test**: What happens if logo URL is invalid

**Steps**:
1. Modify props to use broken URL: `rightLogoUrl="https://invalid.url/image.jpg"`
2. Verify app still loads (no crash)
3. Verify missing logo gracefully hides
4. Verify other UI elements still functional

---

### 3. Media/Vimeo Link Integration

#### Test 3.1: Vimeo Link in Event Modal
**Expected**: Clicking event opens modal with Vimeo video player

**Prerequisites**:
- Event must have valid URL in `link_for_audio_or_video` column
- URL must point to Vimeo (vimeo.com)

**Steps**:
1. Click on an event point on globe (with Vimeo link)
2. Event Modal opens
3. Scroll down to find media section
4. Verify Vimeo iframe loads
5. Verify play button is visible
6. Click play to test video loading

**Visual Verification**:
```
┌─────────────────────────────────────────────────────┐
│ Event Name ✕                                         │
├─────────────────────────────────────────────────────┤
│ 📍 Location  │  📅 Date                             │
│ 🏙️ City      │  📆 Year                             │
│ #️⃣ Number   │  🎵 Raga (if available)              │
├─────────────────────────────────────────────────────┤
│ [Image Carousel]                                     │
├─────────────────────────────────────────────────────┤
│ 📝 Description: ...                                  │
├─────────────────────────────────────────────────────┤
│ [Vimeo Video Player]  ← Should load here           │
│ [Play Button]                                       │
└─────────────────────────────────────────────────────┘
```

#### Test 3.2: YouTube Link Support
**Expected**: YouTube URLs also play in embedded player

**Steps**:
1. If you have YouTube links in data, click that event
2. Verify YouTube iframe loads
3. Verify video plays

#### Test 3.3: Direct Audio Files
**Expected**: Audio extensions (.mp3, .wav) play in audio player

**Steps**:
1. If you have audio file URLs, click event
2. Verify standard HTML5 audio player loads
3. Verify play controls work

#### Test 3.4: Missing Media
**Expected**: Events without media gracefully show message

**Steps**:
1. Find event without `link_for_audio_or_video` value
2. Click event to open modal
3. Verify no errors in console
4. Verify modal still displays all other info

---

### 4. Coordinate Filter Logic

#### Test 4.1: Filtering by Country (Global Support)
**Steps**:
1. Open filter menu
2. Search/select "Australia"
3. Verify only Australian events show on globe
4. Try "Brazil"
5. Verify Western Hemisphere events show

#### Test 4.2: Filtering by Continent
**Steps**:
1. Find continent buttons at bottom
2. Click "South America"
3. Verify only South American events render
4. Check coordinates are negative latitude
5. Click "Australia"
6. Verify Southern Hemisphere events render

#### Test 4.3: Year/Event Number Filtering
**Steps**:
1. Apply multiple filters simultaneously
2. Year: 2023, Country: Australia
3. Verify results are correctly filtered
4. Ensure negative coordinates don't cause issues

---

### 5. Console Checks

#### Expected: No errors in browser console

**Steps**:
1. Open DevTools (F12)
2. Go to Console tab
3. Refresh page
4. Verify no red errors
5. Warnings OK (yellow)
6. Check for coordinate parsing messages (should be silent)

**Should NOT see**:
- `Cannot read property 'lat' of undefined`
- `Invalid coordinates`
- `Failed to load logo`
- NaN errors in coordinate calculations

---

### 6. Data Verification in Browser

#### Check Mapped Event Object

**Steps**:
1. Open DevTools → Console
2. Run (after page loads):
```javascript
// Check if events are mapped correctly
JSON.stringify(window.__EVENTS || {}, null, 2)

// Or inspect first event in network tab
// Open Network → XHR → events_365 → Response
```

**Expected in mapped event**:
```json
{
  "no": 1,
  "eventNumber": 1,
  "lat": -25.2744,
  "lng": 133.7751,
  "audioUrl": "https://vimeo.com/...",
  "eventName": "...",
  "place": "...",
  "city": "...",
  "raga": "...",
  ...
}
```

---

## Troubleshooting

### Issue: Logos not showing
**Checklist**:
- [ ] Check image URLs are valid (test in new tab)
- [ ] Check props are passed to App component
- [ ] Check DevTools → Network → image requests (any 404?)
- [ ] Try different image URLs from reputable sources
- [ ] Check browser console for CORS errors

### Issue: Australia events not appearing
**Checklist**:
- [ ] Check database has negative latitude values
- [ ] Verify coordinates are in valid range (-90 to 90)
- [ ] Check `latitude` and `longitude` column names match code
- [ ] Look at supabase table directly
- [ ] Check filter logic isn't excluding valid events

### Issue: Vimeo not loading in modal
**Checklist**:
- [ ] Verify Vimeo URL is correct format: `https://vimeo.com/VIDEO_ID`
- [ ] Check AudioPlayer component logs (console)
- [ ] Verify CORS not blocking iframe
- [ ] Try public Vimeo video link
- [ ] Check browser allows iframes

### Issue: Media plays multiple times
**Checklist**:
- [ ] Verify App properly stops playback on close (useEffect)
- [ ] Check EventModal cleanup on unmount
- [ ] Clear browser cache: Ctrl+Shift+Delete

---

## Performance Testing

### Lighthouse Audit
**Steps**:
1. Open DevTools → Lighthouse
2. Run audit for Performance
3. Check scores:
   - Largest Contentful Paint (LCP): < 2.5s ✓
   - Cumulative Layout Shift (CLS): < 0.1 ✓
   - First Input Delay (FID): < 100ms ✓

### Network Testing
**Steps**:
1. Open DevTools → Network
2. Filter: XHR
3. Refresh app
4. Verify:
   - events_365 loads quickly
   - events365_media loads efficiently
   - Images load with reasonable size

---

## Sign-off Checklist

- [ ] Southern/Western hemisphere events render
- [ ] Left logo displays and aligns
- [ ] Right logo displays and aligns
- [ ] Logos responsive on all screen sizes
- [ ] Vimeo links play in modal
- [ ] No console errors
- [ ] Filtering works with global coordinates
- [ ] Event details modal shows all fields including Raga
- [ ] Media gracefully handles missing links

---

## Additional Notes

- Test in Chrome, Firefox, Safari, and Edge if possible
- Mobile testing essential (use DevTools device toolbar)
- Check actual data in Supabase to verify coordinates
- Verify Vimeo links are publicly embeddable (privacy settings)
