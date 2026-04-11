# SlipIn - Project TODO

## Branding & Theme
- [x] Set dark neon theme colors in theme.config.js
- [x] Upload and set app logo (provided by user)
- [x] Update app.config.ts with branding info

## Authentication Screens
- [x] Splash screen with neon logo animation
- [x] Login screen (email/password)
- [x] Signup screen (email/password)
- [x] Profile creation screen (photo, name, age, gender, bio, tags)

## Map Home Screen
- [x] Full-screen MapView with dark/night style
- [x] Simulated nearby user avatar pins
- [x] Floating top bar (logo, Go Dark toggle, profile avatar)
- [x] Floating bottom controls (radius, nearby list, event board)
- [x] Tap pin to open user preview modal
- [x] Web fallback map (simulated dark grid with pins)

## Discovery Screens
- [x] Nearby users list screen
- [x] Radius toggle bottom sheet modal
- [x] User preview modal/screen

## Messaging Screens
- [x] Direct chat screen (1-to-1)
- [x] Event message board screen (group chat)

## Settings & Privacy Screens
- [x] Settings screen (profile, filters, privacy, logout)
- [x] Privacy dark zones screen
- [x] Go Dark master toggle
- [x] Ghost Delay feature (simulated 15-min delay)

## Navigation
- [x] Expo Router navigation structure
- [x] Auth flow (unauthenticated → login/signup → profile → map)
- [x] Tab navigation for main app screens
- [x] Modal navigation for preview/radius/board

## State Management
- [x] Auth context (user state, login/logout)
- [x] Location context (current location, radius setting)
- [x] Simulated nearby users data
- [x] Dark zones / Go Dark state
- [x] Messages state (local simulation)

## Filters
- [x] Age range filter
- [x] Interest filter
- [x] "What I'm here for" filter

## Polish
- [x] Neon glow effects on key elements
- [x] Smooth transitions between screens
- [x] Loading states
- [x] Empty states

## Tests
- [x] Filter logic tests (age, gender, hereFor)
- [x] Radius level configuration tests
- [x] Dark Zone add/remove tests
- [x] Ghost Delay calculation tests
- [x] Message structure tests
- [x] Interest tag validation tests

## UI Improvements (v1.1)
- [x] Onboarding intro slider (4 swipeable slides before signup)
- [x] Remove square background behind logo on Login screen
- [x] Remove square background behind logo on Signup screen
- [x] Logo confirmed clean on Splash, Map, Onboarding screens (no box)
- [x] Update footer text: "Made with Love by OSA"
- [x] Production-level visual polish (typography, spacing, shadows, gradients)
- [x] Onboarding wired into navigation: first-time users → onboarding → signup
- [x] Returning users skip onboarding and go directly to login

## Bug Fixes (v1.2)
- [x] Confirmed no unsupported dependencies (react-native-swiper, react-native-pager-view not present)
- [x] Onboarding slider already uses pure FlatList + Animated (Expo-compatible, no swiper)
- [x] Fixed Expo preview crash: created index.js entry point at project root
- [x] Fixed metro.config.js resolver to use context.resolveRequest fallback correctly
- [x] Android bundle: 1706 modules bundled successfully
- [x] iOS bundle: 1699 modules bundled successfully
- [x] All 19 tests pass
