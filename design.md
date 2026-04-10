# SlipIn — Design Document

## App Identity
- **Name**: SlipIn
- **Tagline**: Maybe Meet Now
- **Target**: Adults in the US at stadiums, concerts, festivals, bars, downtown areas
- **Tone**: Confident, adult, sultry, mysterious

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0A0A0F` | Deep near-black |
| Surface | `#12121A` | Cards, modals |
| Surface2 | `#1A1A28` | Elevated cards |
| Primary (Neon Teal) | `#00F5D4` | CTAs, active states, highlights |
| Secondary (Neon Purple) | `#B44FFF` | Secondary accents |
| Accent (Neon Pink) | `#FF2D78` | Notifications, badges |
| Foreground | `#F0F0FF` | Primary text |
| Muted | `#7070A0` | Secondary text |
| Border | `#2A2A40` | Dividers, borders |
| Error | `#FF4466` | Error states |
| Success | `#00F5D4` | Success states (same as primary) |

---

## Screen List

1. **Splash Screen** — Animated logo reveal with neon glow
2. **Login Screen** — Email/password login, dark form
3. **Signup Screen** — Email/password registration
4. **Profile Creation Screen** — Name, age, gender, bio, photo, interest tags
5. **Map Home Screen** — Full-screen map with user avatar pins, floating controls
6. **Nearby Users List** — Scrollable list of nearby users with distance
7. **Radius Toggle Screen** — Modal to select location precision level
8. **User Preview Screen** — Profile card modal with photo, bio, message button
9. **Chat Screen** — 1-to-1 direct message thread
10. **Event Message Board** — Group chat for users in same area/venue
11. **Settings Screen** — Account, notifications, privacy controls
12. **Privacy Dark Zones Screen** — Manage dark zones (Home, Work, Family) + Go Dark toggle

---

## Primary Content & Functionality

### Splash Screen
- Full-screen dark background
- Neon "SlipIn" logo with glow animation
- Tagline "Maybe Meet Now" fade-in
- Auto-navigate to Login after 2.5s

### Login Screen
- Email + password inputs (dark glass-style)
- "Sign In" primary button (neon teal)
- "Create Account" link
- Forgot password link

### Signup Screen
- Email + password + confirm password
- "Create Account" button
- Back to Login link

### Profile Creation Screen
- Profile photo upload (camera icon placeholder)
- Name, Age, Gender fields
- Short bio text area (max 150 chars)
- "What I'm here for" tag selector: Flirt, Drink, Slip Away, Hang Out
- "Save Profile" button

### Map Home Screen (PRIMARY)
- Full-screen MapView (dark/night map style)
- Floating user avatar pins for nearby users
- Bottom floating control bar:
  - Radius toggle button
  - Nearby list button
  - Event board button
- Top floating bar:
  - App logo (small)
  - "Go Dark" toggle
  - Profile avatar (navigates to settings)
- Tap pin → opens User Preview modal

### Nearby Users List
- FlatList of user cards
- Each card: avatar, name, age, distance, interest tags
- Tap → User Preview

### Radius Toggle
- Bottom sheet modal
- 4 options: Building (precise), Neighborhood (2mi), City, State
- Visual indicator of selected level

### User Preview Screen
- Modal overlay
- Large photo
- Name, age, bio
- Interest tags
- "Message" button → Chat
- "Dismiss" button

### Chat Screen
- Message bubbles (sent = neon teal right, received = surface left)
- Text input at bottom
- User name + avatar in header

### Event Message Board
- Group chat interface
- Venue/area name as header
- Messages from all users in same area
- Simulated event context

### Settings Screen
- Profile section (edit profile link)
- Privacy section (Dark Zones link)
- Filters section (age range, interests, "here for" filter)
- Account section (logout)

### Privacy Dark Zones Screen
- "Go Dark" master toggle
- List of dark zones: Home, Work, Family House
- Add/remove zones
- Ghost Delay info (15-min delay simulation)

---

## Key User Flows

### New User Flow
1. Splash → Login → "Create Account" → Signup → Profile Creation → Map Home

### Discovery Flow
1. Map Home (see pins) → Tap pin → User Preview → "Message" → Chat

### Privacy Flow
1. Settings → Dark Zones → Toggle "Go Dark" or add zone

### Event Board Flow
1. Map Home → Event Board button → Event Message Board

### Radius Change Flow
1. Map Home → Radius button → Radius Toggle modal → Select level → Map updates

---

## Layout Principles

- **Map-first**: Map occupies 100% of home screen, controls float above
- **Dark everywhere**: No light surfaces, all backgrounds are near-black
- **Neon accents**: Teal (#00F5D4) for primary actions, purple (#B44FFF) for secondary
- **Minimal chrome**: Floating controls only, no heavy navigation bars on map
- **Tab bar**: Minimal, dark, only on non-map screens (or transparent overlay on map)
- **Cards**: Rounded (16-24px), semi-transparent dark glass effect
- **Typography**: Bold headings, medium body, all on dark backgrounds
