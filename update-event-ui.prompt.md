---
name: update-event-ui
description: "Update the JavaScript app with event filtering, search, year dropdown, and media playback in event details."
argument-hint: "Describe the app file or dataset source if you need the prompt to target a different project path."
agent: agent
---
Use this prompt to update a React-based JavaScript app that renders event data from Supabase.

Task:
- Add a dynamic Country filter with suggestions from available event data, and allow manual text entry when country values are missing.
- Remove the Event Number filter entirely and replace it with:
  - Event Type filter (dropdown selectable list)
  - Search bar for keyword-based searching across event fields.
- Add a dedicated Event Name filter for partial, case-insensitive matching.
- Replace the current year input with a Year dropdown populated from available dataset years.
- Remove the Refresh Data button and any manual refresh-specific logic.
- In the Event Details modal/page, play media directly using HTML5 video/audio from the event's media URL.
- Handle invalid or missing media URLs gracefully.
- Keep filtering combined, modular, and readable.

Expected output:
- Updated JavaScript code for the app component(s)
- Comments explaining key changes in the code
- No broken existing functionality
