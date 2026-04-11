const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// IMPORTANT: Pass __dirname (absolute path) to getDefaultConfig so Metro
// sets projectRoot and server.unstable_serverRoot to absolute paths.
// Using a relative "." causes the native bundle entry point to fail.
const config = getDefaultConfig(__dirname);

// Stub react-native-maps on web (native-only module, not available in browser).
// For native (iOS/Android), react-native-maps resolves normally from node_modules.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-maps") {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "lib/maps-web-stub.js"),
    };
  }
  // Delegate to Metro's built-in resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  forceWriteFileSystem: true,
});
