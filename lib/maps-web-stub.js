// Web stub for react-native-maps
// react-native-maps is a native-only module; on web we use a simulated map
const React = require("react");
const { View } = require("react-native");

const MapView = React.forwardRef(function MapView({ children, style }, ref) {
  return React.createElement(View, { style }, children);
});

MapView.displayName = "MapView";

const Marker = function Marker({ children, onPress }) {
  return React.createElement(View, { onPress }, children);
};

const Circle = function Circle() {
  return null;
};

const Callout = function Callout({ children }) {
  return React.createElement(View, null, children);
};

const Polygon = function Polygon() {
  return null;
};

const Polyline = function Polyline() {
  return null;
};

const PROVIDER_GOOGLE = "google";
const PROVIDER_DEFAULT = null;

module.exports = MapView;
module.exports.default = MapView;
module.exports.Marker = Marker;
module.exports.Circle = Circle;
module.exports.Callout = Callout;
module.exports.Polygon = Polygon;
module.exports.Polyline = Polyline;
module.exports.PROVIDER_GOOGLE = PROVIDER_GOOGLE;
module.exports.PROVIDER_DEFAULT = PROVIDER_DEFAULT;
