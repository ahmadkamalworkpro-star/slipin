// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Bundle ID format: space.manus.<project_name_dots>.<timestamp>
const rawBundleId = "space.manus.slipin.t20260410141916";
const bundleId =
  rawBundleId
    .replace(/[-_]/g, ".")
    .replace(/[^a-zA-Z0-9.]/g, "")
    .replace(/\.+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase()
    .split(".")
    .map((segment) => {
      return /^[a-zA-Z]/.test(segment) ? segment : "x" + segment;
    })
    .join(".") || "space.manus.app";

const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  appName: "SlipIn",
  appSlug: "slipin",
  logoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663295506312/VrzLjexObOjvOoBp.png",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    infoPlist: {
      NSLocationWhenInUseUsageDescription: "SlipIn uses your location to show you nearby people.",
      NSLocationAlwaysAndWhenInUseUsageDescription: "SlipIn uses your location to show you nearby people.",
      NSPhotoLibraryUsageDescription: "SlipIn needs access to your photos to set a profile picture.",
      NSCameraUsageDescription: "SlipIn needs camera access to take a profile photo.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0A0A0F",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: [
      "POST_NOTIFICATIONS",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "READ_MEDIA_IMAGES",
      "READ_EXTERNAL_STORAGE",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: env.scheme, host: "*" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-location",
      {
        locationWhenInUsePermission: "Allow SlipIn to use your location to show nearby people.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "Allow SlipIn to access your photos for your profile picture.",
        cameraPermission: "Allow SlipIn to use your camera for your profile picture.",
      },
    ],
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#0A0A0F",
        dark: {
          backgroundColor: "#0A0A0F",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
