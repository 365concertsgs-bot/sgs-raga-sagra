# Event Image Slideshow - Visual Guide

## 📺 User Flow

### 1. User Clicks on Event on Globe
```
┌─────────────────────────────────────────┐
│          Interactive Globe              │
│                                         │
│     User clicks on event marker ⚫      │
│                                         │
└─────────────────────────────────────────┘
           ↓
```

### 2. Event Modal Opens with Images
```
┌──────────────────────────────────────────────────────────┐
│                    EVENT DETAILS MODAL                    │
├──────────────────────────────────────────────────────────┤
│                                                      [✕]  │
│ Event Name: Raga Sagara - Mumbai                         │
│ Event #42                                                │
├──────────────────────────────────────────────────────────┤
│                                                           │
│ Location: Mumbai    City: Mumbai   Date: 15-Dec-2023     │
│                                                           │
│ ┌────────────────────────────────────────────────────┐  │
│ │                                                    │  │
│ │            [Main Image Display Area]              │  │
│ │                                                    │  │
│ │           (Image auto-rotates here)               │  │
│ │                                                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                           │
│   [← Previous]   Image 2 / 5    [Next →]                │
│                                                           │
│ Description:                                             │
│ • Event highlights and details                          │
│ • Ragas Played: Bhairav, Yaman                         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## 🎬 Slideshow Behavior

### Auto-Rotation Timeline
```
Time    Image    Event
────────────────────────────────────────
0s      Image 1  ← User opens modal
4s      Image 2  ← Auto-rotates
8s      Image 3  ← Auto-rotates
12s     Image 4  ← Auto-rotates
16s     Image 5  ← Auto-rotates
20s     Image 1  ← Loops to start
```

### Navigation Controls

#### Desktop View
```
        [← Previous Button]
              ↓
        Image Display
              ↓
        [← Previous] [Image 2/5] [Next →]
              ↑                      ↑
        Click to go back    Click to go forward
```

#### Mobile View
```
Image Display
     ↓
[← Prev] Image 2/5 [Next →]
  ↑                    ↑
  Tap to go back  Tap to go forward
```

## ⌨️ Keyboard Navigation

| Key | Action |
|-----|--------|
| ← (Left Arrow) | Previous image |
| → (Right Arrow) | Next image |
| Escape | Close modal (if implemented) |

Example usage:
```
User presses → arrow key
       ↓
Show next image
       ↓
(or loop to first image if at end)
```

## 🔄 Navigation Flow Chart

```
             Image Display
                   ↑
                   │
        ┌──────────┼──────────┐
        │          │          │
        ↓          ↓          ↓
    [Previous]  Auto-      [Next]
               Rotate
        │          │          │
        ↓          ↓          ↓
     Prev Image  Prev Image  Next Image
     (if exists) (every 4s) (if exists)
```

## 🖼️ Image Matching Process

```
Step 1: Fetch Events
┌─────────────────────┐
│ events365 table     │
│ - Event #42         │
│ - Event #100        │
│ - Event #156        │
└─────────────────────┘
         ↓

Step 2: Fetch Media
┌──────────────────────────┐
│ events365_media table    │
│ - event_number: 42       │
│ - url: image1.jpg        │
│ - event_number: 42       │
│ - url: image2.jpg        │
│ - event_number: 100      │
│ - url: image3.jpg        │
└──────────────────────────┘
         ↓

Step 3: Match & Resolve URLs
┌──────────────────────────────────────┐
│ Event #42 → [Image 1, Image 2]       │
│ Event #100 → [Image 3]               │
│ Event #156 → [] (no images)          │
└──────────────────────────────────────┘
         ↓

Step 4: Display in Modal
✓ User clicks Event #42 → Shows 2 images in slideshow
✓ User clicks Event #100 → Shows 1 image
✓ User clicks Event #156 → Shows "No images available"
```

## 📊 Image Loading States

```
User Clicks Event
       ↓
    ┌─────────────────────────────┐
    │  Checking for images...     │
    └─────────────────────────────┘
       ↓
    ┌──────────────────────────────────────┐
    │  Images Found?                       │
    └──────────────────────────────────────┘
       ↙              ↘
     YES              NO
      ↓               ↓
   Show          Show Message:
  Images         📷 No images
   with          available for
Controls        this event
```

## 🎨 UI States

### State 1: Multiple Images (2+)
```
✓ Main image displayed
✓ Previous button enabled
✓ Next button enabled
✓ Counter shows: "Image 2 / 5"
✓ Auto-rotation active
✓ Keyboard navigation active
```

### State 2: Single Image
```
✓ Main image displayed
✓ Previous button enabled (but disabled appearance)
✓ Next button enabled (but disabled appearance)
✓ Counter shows: "Image 1 / 1"
✓ Auto-rotation inactive (only 1 image)
✓ Keyboard navigation inactive
```

### State 3: No Images
```
✗ No main image
✗ No navigation buttons
✗ Message: "📷 No images available for this event"
✗ Auto-rotation inactive
✗ Keyboard navigation inactive
```

### State 4: Image Load Error
```
✓ Error message displayed
✗ Main image hidden
✓ Navigation buttons still work
Message: "⚠️ Failed to load image. Image URL might be invalid."
```

## 🔍 Debug Console Output

When you click on an event, the console shows:

```javascript
// If images found:
✓ Event #42 "Raga Sagara - Mumbai": Found 5 image(s)
Event "Raga Sagara - Mumbai" has 5 image(s): 
  ['https://example.com/img1.jpg', 'https://...img2.jpg', ...]

// If no images found:
⚠ Event #156 "Raga Sagara - Paris": No images found
Event "Raga Sagara - Paris" has no images

// URL resolution:
Media 1: Resolved URL
  raw: "event42_image1.jpg"
  resolved: "https://supabase.../event42_image1.jpg"
```

## 🎯 Feature Interaction Examples

### Example 1: Auto-Rotation
```
User opens modal
       ↓
[Image 1] shown for 4 seconds
       ↓ (timer fires)
[Image 2] shown for 4 seconds
       ↓ (timer fires)
[Image 3] shown for 4 seconds
       ↓
User manually clicks [Next →]
       ↓
[Image 4] shown (manual override)
       ↓ (timer resets)
[Image 5] shown after 4 seconds
```

### Example 2: Manual Navigation
```
User sees: Image 3 / 5
       ↓
User clicks [← Previous]
       ↓
Image 2 / 5 (counter updates)
       ↓
User presses ← arrow key twice
       ↓
Image 1 / 5 (keeps going back)
       ↓
User presses ← arrow key again
       ↓
Image 5 / 5 (loops to end)
```

### Example 3: Error Recovery
```
User sees: [Image loads and displays fine]
       ↓
User clicks [Next →]
       ↓
[Broken image - displays error message]
       ↓
User clicks [Next →] again
       ↓
[Next image loads fine - error clears]
```

## 📈 Performance Optimizations

```
App Load
   ↓
Fetch Events & Media (parallel)
   ↓
Pre-resolve URLs (happens once)
   ↓
Match images to events (happens once)
   ↓
Attach images to event objects
   ↓
Modal Opens
   ↓
Images use lazy loading & async decoding
   ↓
No additional API calls for navigation
✓ Smooth, fast navigation between images
```

---

This visual guide shows how the image slideshow system works at each stage of user interaction!
