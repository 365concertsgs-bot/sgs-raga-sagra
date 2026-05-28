# Event Image Slideshow Implementation Guide

## 📋 Overview

This document explains how event images are fetched from the `events365_media` table and displayed as an auto-rotating slideshow in the event details modal.

## ✨ Features

### Automatic Image Slideshow
- **Auto-rotation**: Images automatically rotate every 4 seconds
- **Manual Navigation**: Previous/Next buttons to manually browse images
- **Keyboard Navigation**: Use arrow keys (← →) to navigate images
- **Image Counter**: Shows current image number (e.g., "Image 1 / 5")
- **Error Handling**: Displays warning if image fails to load
- **No Images Message**: Shows friendly message if event has no images

## 🔧 How It Works

### 1. Media Fetching (App.jsx)

When the app loads, it:
1. Fetches events from the `events365` table
2. Fetches media from the `events365_media` table
3. Pre-resolves all media URLs (handles Supabase storage paths)
4. Matches media to events by:
   - Event Number (primary key match)
   - Event Name
   - Numeric patterns in filenames

### 2. Image Matching Algorithm

The system matches images to events using intelligent pattern matching:

```javascript
// Images are matched if:
1. Media event field exactly matches event ID
2. Numeric tokens in media filename match event number
3. Event name appears in media filename
4. Media filename contains event number as word boundary
```

### 3. Image Display (EventModal.jsx)

When a user clicks an event:
1. Modal opens showing event details
2. Main image displays from the matched images array
3. Navigation controls appear if multiple images exist
4. Slideshow auto-rotates every 4 seconds
5. User can navigate manually with Previous/Next buttons

## 📊 Database Schema Requirements

### events365_media Table

Your media table should have these columns:

```sql
CREATE TABLE events365_media (
  id SERIAL PRIMARY KEY,
  event_number INTEGER,              -- or "Event", "EventNo", "No"
  url VARCHAR(500),                  -- or "URL", "Image", "Link"
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Supported Column Names

**Event Matching Columns:**
- `Event`, `event`, `Event No`, `EventNo`, `EventNumber`, `event_number`, `eventno`, `No`, `no`, `Event ID`, `EventID`, `eventid`, `Event Name`, `event_name`, `eventname`, `event name`, `Title`, `title`

**URL Columns:**
- `URL`, `url`, `Image`, `image`, `image_url`, `imageUrl`, `media_url`, `MediaURL`, `mediaUrl`, `Link`, `link`

## 🐛 Debugging & Troubleshooting

### Enable Console Logging

Open browser developer tools (F12 or Ctrl+Shift+I) and check the Console tab.

#### Expected Log Messages

**When app loads:**
```
✓ Loaded 365 events from Supabase
✓ Loaded 1200 media records from database
Sample media record structure: ['id', 'event_number', 'url', ...]
```

**For each event with images:**
```
✓ Event #42 "Raga Sagara - Mumbai": Found 3 image(s)
Event "Raga Sagara - Mumbai" has 3 image(s): 
  ['https://...', 'https://...', 'https://...']
```

**For events without images:**
```
⚠ Event #100 "Raga Sagara - New York": No images found
Event "Raga Sagara - New York" has no images
```

#### URL Resolution Logs
```
Media 1: Resolved URL
  raw: "event_100_image_1.jpg"
  resolved: "https://supabase.../event_100_image_1.jpg"
```

### Common Issues & Solutions

#### Issue: "No images available for this event"

**Possible Causes:**
1. Media records don't exist in `events365_media` table
2. Event number/name doesn't match between events and media tables
3. URL column name is different than expected

**Solution:**
1. Check console logs for event details
2. Verify `events365_media` table has data
3. Check media record event field matches event ID
4. Look for the "Sample media record structure" log to see actual column names
5. Update the supported column names in code if needed

#### Issue: Images load but show broken image icon

**Possible Causes:**
1. URL is invalid or incomplete
2. Supabase storage path is incorrect
3. Image file no longer exists
4. CORS issues

**Solution:**
1. Check console for error message
2. Copy image URL from browser console
3. Test URL directly in browser
4. Verify image file exists in Supabase Storage

#### Issue: Images don't show even though media records exist

**Possible Causes:**
1. Media event field doesn't match event identifiers
2. Numeric pattern matching not working
3. Column names are different

**Solution:**
1. Check console for "⚠ Event: No images found" messages
2. Log actual media record content
3. Verify event ID/name format matches media records
4. Check getEventImageUrls() matching logic

## 📱 UI/UX Details

### Image Navigation Controls

Located below the main image:

```
[← Previous]    Image 3 / 7    [Next →]
```

- **Click Previous**: Go to previous image (loops to end if on first image)
- **Click Next**: Go to next image (loops to start if on last image)
- **Keyboard**: Press ← or → arrow keys to navigate
- **Auto-rotate**: Automatically moves to next image every 4 seconds

### Responsive Design

- **Desktop**: Full-size image with side-by-side navigation
- **Tablet**: Optimized layout with stacked controls
- **Mobile**: Compact button design, touch-friendly

## 🔒 Performance Optimizations

- **Lazy Loading**: Images use `loading="lazy"` and `decoding="async"`
- **URL Pre-resolution**: Media URLs resolved once during load, not per-render
- **Sorted Media**: Media rows sorted by ID for consistent order
- **Memoized Component**: EventModal memoized to prevent unnecessary re-renders

## 🚀 Testing Checklist

- [ ] Open browser developer tools (F12)
- [ ] Click on an event to open modal
- [ ] Verify images load (check Console for logs)
- [ ] Test Previous/Next buttons
- [ ] Test arrow key navigation (← →)
- [ ] Wait 4 seconds to see auto-rotation
- [ ] Test with event that has no images
- [ ] Check for any errors in Console tab

## 📖 Code References

### Image Fetching & Matching
- **Location**: [App.jsx](src/App.jsx#L197) - `getEventImageUrls()` function
- **Handles**: URL matching, event-to-media linking, fallback images

### Image Display & Navigation
- **Location**: [EventModal.jsx](src/EventModal.jsx#L117) - Component implementation
- **Features**: Slideshow, navigation, error handling

### Media Table Candidates
Searched in order (first found is used):
1. `events365_media`
2. `events_365_media`
3. `events_media`
4. `media`

## 🔗 Related Files

- [src/App.jsx](src/App.jsx) - Event and media fetching
- [src/EventModal.jsx](src/EventModal.jsx) - Image display and slideshow
- [src/supabaseClient.js](src/supabaseClient.js) - Supabase configuration
- [package.json](package.json) - Dependencies

## 💡 Tips & Tricks

1. **Check Sample Media Structure**: Look for "Sample media record structure" in console logs to see actual column names used by your database

2. **Quick Debug**: Add this to your browser console to check if images loaded:
   ```javascript
   // Check first event's images
   console.log(window.currentEvent?.images);
   ```

3. **Verify URLs**: Copy image URL from console and test in new tab to verify image exists

4. **Database Optimization**: Index the event matching columns for faster queries:
   ```sql
   CREATE INDEX idx_events365_media_event ON events365_media(event_number);
   ```

## 📞 Support

If images aren't displaying:
1. Check the **Debugging & Troubleshooting** section
2. Review Console logs for error messages
3. Verify `events365_media` table structure matches requirements
4. Ensure event numbers/names match between tables
5. Check that URLs are valid and accessible

---

**Last Updated**: May 29, 2026
**Version**: 1.0
