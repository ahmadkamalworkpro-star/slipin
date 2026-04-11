// Root entry point for Expo Go (native) and web.
//
// When Expo Go scans the QR code, it requests /index.bundle from Metro.
// Metro resolves this file as the entry point (./index from project root).
//
// For web (expo export --platform web), expo-router/entry handles registration
// automatically via the package.json "main" field.
//
// This file re-exports expo-router/entry which calls registerRootComponent
// internally and bootstraps the Expo Router file-based navigation.
import 'expo-router/entry';
