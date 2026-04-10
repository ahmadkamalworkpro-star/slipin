import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  Animated,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, UserAvatar, TagBadge, NeonButton } from "@/components/slipin-ui";
import { useApp } from "@/lib/app-context";
import type { NearbyUser, RadiusLevel } from "@/lib/app-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const RADIUS_INFO: Record<RadiusLevel, { label: string; meters: number; desc: string }> = {
  building: { label: "Building", meters: 100, desc: "Same venue" },
  neighborhood: { label: "Neighborhood", meters: 3200, desc: "~2 mile radius" },
  city: { label: "City", meters: 16000, desc: "~10 mile radius" },
  state: { label: "State", meters: 320000, desc: "~200 mile radius" },
};

// Lazy load MapView only on native platforms
let MapView: any = null;
let Marker: any = null;
let Circle: any = null;
let PROVIDER_DEFAULT: any = null;
let Location: any = null;

if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
  Circle = maps.Circle;
  PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Location = require("expo-location");
}

// Dark map style
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0A0A0F" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7070A0" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0A0A0F" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#9090C0" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#7070A0" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0F1520" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1A1A28" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#2A2A40" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1E1E30" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050510" }] },
];

const DEFAULT_REGION = {
  latitude: 40.7580,
  longitude: -73.9855,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export default function MapHomeScreen() {
  const { currentUser, nearbyUsers, filters, toggleDarkMode } = useApp();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const previewAnim = useRef(new Animated.Value(0)).current;

  const radiusLevel = currentUser?.radiusLevel ?? "neighborhood";
  const isDark = currentUser?.isDark ?? false;
  const radiusInfo = RADIUS_INFO[radiusLevel];

  useEffect(() => {
    if (Platform.OS !== "web") {
      requestLocation();
    }
  }, []);

  const requestLocation = async () => {
    if (!Location) return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      setLocationGranted(true);
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const newRegion = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      } catch {
        // use default
      }
    }
  };

  const openUserPreview = useCallback((user: NearbyUser) => {
    setSelectedUser(user);
    setShowPreview(true);
    Animated.spring(previewAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
  }, [previewAnim]);

  const closePreview = useCallback(() => {
    Animated.timing(previewAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowPreview(false);
      setSelectedUser(null);
    });
  }, [previewAnim]);

  const filteredUsers = nearbyUsers.filter((u) => {
    if (filters.minAge && u.age < filters.minAge) return false;
    if (filters.maxAge && u.age > filters.maxAge) return false;
    if (filters.hereFor.length > 0 && !u.tags.some((t) => filters.hereFor.includes(t))) return false;
    if (filters.genders.length > 0 && !filters.genders.includes(u.gender)) return false;
    return true;
  });

  // Web fallback: show a simulated map view
  if (Platform.OS === "web") {
    return (
      <WebMapFallback
        filteredUsers={filteredUsers}
        isDark={isDark}
        radiusLevel={radiusLevel}
        radiusInfo={radiusInfo}
        currentUser={currentUser}
        insets={insets}
        onUserPress={openUserPreview}
        onToggleDark={toggleDarkMode}
        onShowRadius={() => setShowRadiusModal(true)}
        showPreview={showPreview}
        selectedUser={selectedUser}
        previewAnim={previewAnim}
        onClosePreview={closePreview}
        showRadiusModal={showRadiusModal}
        onCloseRadius={() => setShowRadiusModal(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Full-screen Map */}
      {MapView && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          customMapStyle={DARK_MAP_STYLE}
          showsUserLocation={locationGranted}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          toolbarEnabled={false}
        >
          {Circle && (
            <Circle
              center={{ latitude: region.latitude, longitude: region.longitude }}
              radius={radiusInfo.meters}
              strokeColor={`${COLORS.primary}40`}
              fillColor={`${COLORS.primary}08`}
              strokeWidth={1}
            />
          )}
          {Marker && filteredUsers.map((user) => (
            <Marker
              key={user.id}
              coordinate={{ latitude: user.latitude, longitude: user.longitude }}
              onPress={() => openUserPreview(user)}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.markerContainer}>
                <View style={[styles.markerRing, { borderColor: COLORS.primary }]}>
                  <UserAvatar photo={user.photo} name={user.name} size={40} online />
                </View>
                <View style={styles.markerTail} />
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Top overlay bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <LinearGradient
          colors={["rgba(10,10,15,0.95)", "rgba(10,10,15,0)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.topBarContent}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.topLogo}
            resizeMode="contain"
          />
          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={[styles.darkToggle, isDark && styles.darkToggleActive]}
              onPress={toggleDarkMode}
              activeOpacity={0.8}
            >
              <Text style={[styles.darkToggleText, isDark && { color: COLORS.accent }]}>
                {isDark ? "🌑 Dark" : "👁 Visible"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/settings" as any)}
              activeOpacity={0.8}
            >
              <UserAvatar
                photo={currentUser?.photo ?? null}
                name={currentUser?.name ?? "?"}
                size={36}
                online={!isDark}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom overlay controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <LinearGradient
          colors={["rgba(10,10,15,0)", "rgba(10,10,15,0.95)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.bottomBarContent}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setShowRadiusModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.controlBtnIcon}>📍</Text>
            <Text style={styles.controlBtnLabel}>{radiusInfo.label}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => router.push("/(tabs)/nearby" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.controlBtnIcon}>👥</Text>
            <Text style={styles.controlBtnLabel}>{filteredUsers.length} Nearby</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => router.push("/(tabs)/event-board" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.controlBtnIcon}>🎉</Text>
            <Text style={styles.controlBtnLabel}>Event Board</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isDark && (
        <View style={[styles.userCountBadge, { top: insets.top + 70 }]}>
          <View style={styles.userCountDot} />
          <Text style={styles.userCountText}>{filteredUsers.length} people nearby</Text>
        </View>
      )}

      {isDark && (
        <View style={styles.darkOverlay} pointerEvents="none">
          <Text style={styles.darkOverlayText}>🌑 You're invisible</Text>
        </View>
      )}

      <RadiusModal
        visible={showRadiusModal}
        currentLevel={radiusLevel}
        onClose={() => setShowRadiusModal(false)}
      />

      {showPreview && selectedUser && (
        <UserPreviewModal
          user={selectedUser}
          anim={previewAnim}
          onClose={closePreview}
          onMessage={() => {
            closePreview();
            router.push({ pathname: "/(tabs)/chat", params: { userId: selectedUser.id } } as any);
          }}
        />
      )}
    </View>
  );
}

// ─── Web Map Fallback ──────────────────────────────────────────────────────────
function WebMapFallback({
  filteredUsers,
  isDark,
  radiusLevel,
  radiusInfo,
  currentUser,
  insets,
  onUserPress,
  onToggleDark,
  onShowRadius,
  showPreview,
  selectedUser,
  previewAnim,
  onClosePreview,
  showRadiusModal,
  onCloseRadius,
}: any) {
  return (
    <View style={styles.container}>
      {/* Simulated dark map background */}
      <View style={styles.webMapBg}>
        {/* Grid lines to simulate map */}
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLine, styles.gridLineH, { top: `${i * 14}%` as any }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLine, styles.gridLineV, { left: `${i * 20}%` as any }]} />
        ))}

        {/* Simulated streets */}
        <View style={[styles.street, styles.streetH, { top: "35%" as any, width: "100%" }]} />
        <View style={[styles.street, styles.streetH, { top: "60%" as any, width: "100%" }]} />
        <View style={[styles.street, styles.streetV, { left: "30%" as any, height: "100%" }]} />
        <View style={[styles.street, styles.streetV, { left: "65%" as any, height: "100%" }]} />

        {/* Radius circle visual */}
        <View style={styles.radiusCircle} />

        {/* User pins on simulated map */}
        {filteredUsers.map((user: NearbyUser, index: number) => {
          const positions = [
            { top: "28%", left: "25%" },
            { top: "45%", left: "55%" },
            { top: "20%", left: "65%" },
            { top: "55%", left: "20%" },
            { top: "38%", left: "75%" },
            { top: "65%", left: "45%" },
          ];
          const pos = positions[index % positions.length];
          return (
            <TouchableOpacity
              key={user.id}
              style={[styles.webMarker, pos as any]}
              onPress={() => onUserPress(user)}
              activeOpacity={0.8}
            >
              <View style={[styles.markerRing, { borderColor: COLORS.primary }]}>
                <UserAvatar photo={user.photo} name={user.name} size={38} online />
              </View>
              <View style={styles.markerTail} />
            </TouchableOpacity>
          );
        })}

        {/* Location label */}
        <View style={styles.webLocationLabel}>
          <Text style={styles.webLocationText}>📍 Madison Square Garden Area</Text>
        </View>
      </View>

      {/* Top overlay bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <LinearGradient
          colors={["rgba(10,10,15,0.95)", "rgba(10,10,15,0)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.topBarContent}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.topLogo}
            resizeMode="contain"
          />
          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={[styles.darkToggle, isDark && styles.darkToggleActive]}
              onPress={onToggleDark}
              activeOpacity={0.8}
            >
              <Text style={[styles.darkToggleText, isDark && { color: COLORS.accent }]}>
                {isDark ? "🌑 Dark" : "👁 Visible"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/settings" as any)}
              activeOpacity={0.8}
            >
              <UserAvatar
                photo={currentUser?.photo ?? null}
                name={currentUser?.name ?? "?"}
                size={36}
                online={!isDark}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom overlay controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <LinearGradient
          colors={["rgba(10,10,15,0)", "rgba(10,10,15,0.95)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.bottomBarContent}>
          <TouchableOpacity style={styles.controlBtn} onPress={onShowRadius} activeOpacity={0.8}>
            <Text style={styles.controlBtnIcon}>📍</Text>
            <Text style={styles.controlBtnLabel}>{radiusInfo.label}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => router.push("/(tabs)/nearby" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.controlBtnIcon}>👥</Text>
            <Text style={styles.controlBtnLabel}>{filteredUsers.length} Nearby</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => router.push("/(tabs)/event-board" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.controlBtnIcon}>🎉</Text>
            <Text style={styles.controlBtnLabel}>Event Board</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isDark && (
        <View style={[styles.userCountBadge, { top: insets.top + 70 }]}>
          <View style={styles.userCountDot} />
          <Text style={styles.userCountText}>{filteredUsers.length} people nearby</Text>
        </View>
      )}

      {isDark && (
        <View style={styles.darkOverlay} pointerEvents="none">
          <Text style={styles.darkOverlayText}>🌑 You're invisible</Text>
        </View>
      )}

      <RadiusModal
        visible={showRadiusModal}
        currentLevel={radiusLevel}
        onClose={onCloseRadius}
      />

      {showPreview && selectedUser && (
        <UserPreviewModal
          user={selectedUser}
          anim={previewAnim}
          onClose={onClosePreview}
          onMessage={() => {
            onClosePreview();
            router.push({ pathname: "/(tabs)/chat", params: { userId: selectedUser.id } } as any);
          }}
        />
      )}
    </View>
  );
}

// ─── Radius Modal ──────────────────────────────────────────────────────────────
function RadiusModal({
  visible,
  currentLevel,
  onClose,
}: {
  visible: boolean;
  currentLevel: RadiusLevel;
  onClose: () => void;
}) {
  const { setRadiusLevel } = useApp();

  const levels: { key: RadiusLevel; label: string; desc: string; icon: string }[] = [
    { key: "building", label: "Building Level", desc: "Precise — same venue", icon: "🏢" },
    { key: "neighborhood", label: "Neighborhood", desc: "~2 mile radius", icon: "🏘️" },
    { key: "city", label: "City Level", desc: "~10 mile radius", icon: "🌆" },
    { key: "state", label: "State Level", desc: "~200 mile radius", icon: "🗺️" },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1}>
        <View style={styles.radiusSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Location Precision</Text>
          <Text style={styles.sheetSubtitle}>How precisely do you want to be shown?</Text>
          {levels.map((l) => (
            <TouchableOpacity
              key={l.key}
              style={[styles.radiusOption, currentLevel === l.key && styles.radiusOptionActive]}
              onPress={() => {
                setRadiusLevel(l.key);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.radiusIcon}>{l.icon}</Text>
              <View style={styles.radiusOptionText}>
                <Text style={[styles.radiusLabel, currentLevel === l.key && { color: COLORS.primary }]}>
                  {l.label}
                </Text>
                <Text style={styles.radiusDesc}>{l.desc}</Text>
              </View>
              {currentLevel === l.key && <Text style={styles.radiusCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── User Preview Modal ────────────────────────────────────────────────────────
function UserPreviewModal({
  user,
  anim,
  onClose,
  onMessage,
}: {
  user: NearbyUser;
  anim: Animated.Value;
  onClose: () => void;
  onMessage: () => void;
}) {
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const distanceText =
    user.distance < 1000
      ? `${user.distance}m away`
      : `${(user.distance / 1000).toFixed(1)}km away`;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.previewBackdrop} onPress={onClose} activeOpacity={1}>
        <Animated.View style={[styles.previewCard, { transform: [{ translateY }] }]}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.previewPhotoContainer}>
              <UserAvatar photo={user.photo} name={user.name} size={90} online />
              <View style={styles.previewDistanceBadge}>
                <Text style={styles.previewDistanceText}>{distanceText}</Text>
              </View>
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>
                {user.name}, <Text style={styles.previewAge}>{user.age}</Text>
              </Text>
              {user.venue && <Text style={styles.previewVenue}>📍 {user.venue}</Text>}
              {user.bio ? <Text style={styles.previewBio}>{user.bio}</Text> : null}
              <View style={styles.previewTags}>
                {user.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} selected small />
                ))}
              </View>
              <View style={styles.previewActions}>
                <NeonButton title="Message" onPress={onMessage} style={styles.previewMsgBtn} />
                <TouchableOpacity style={styles.previewDismissBtn} onPress={onClose}>
                  <Text style={styles.previewDismissText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  // Web map simulation
  webMapBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A0A0F",
    overflow: "hidden",
  },
  gridLine: { position: "absolute", backgroundColor: "#1A1A28" },
  gridLineH: { left: 0, right: 0, height: 1 },
  gridLineV: { top: 0, bottom: 0, width: 1 },
  street: { position: "absolute", backgroundColor: "#1A1A28" },
  streetH: { height: 4 },
  streetV: { width: 4 },
  radiusCircle: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
    backgroundColor: `${COLORS.primary}06`,
    top: "50%",
    left: "50%",
    marginTop: -140,
    marginLeft: -140,
  },
  webMarker: { position: "absolute", alignItems: "center" },
  webLocationLabel: {
    position: "absolute",
    bottom: 160,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  webLocationText: {
    fontSize: 12,
    color: COLORS.muted,
    backgroundColor: `${COLORS.surface}CC`,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  // Top bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    zIndex: 10,
  },
  topBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  topLogo: { width: 60, height: 30 },
  topBarRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  darkToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: `${COLORS.surface}CC`,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  darkToggleActive: { borderColor: COLORS.accent, backgroundColor: `${COLORS.accent}15` },
  darkToggleText: { fontSize: 12, color: COLORS.foreground, fontWeight: "600" },
  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    zIndex: 10,
  },
  bottomBarContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
  },
  controlBtn: {
    alignItems: "center",
    backgroundColor: `${COLORS.surface}E0`,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 90,
  },
  controlBtnIcon: { fontSize: 20, marginBottom: 2 },
  controlBtnLabel: { fontSize: 11, color: COLORS.foreground, fontWeight: "600" },
  // Map markers
  markerContainer: { alignItems: "center" },
  markerRing: {
    borderWidth: 2,
    borderRadius: 24,
    padding: 2,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.primary,
    marginTop: -1,
  },
  // User count badge
  userCountBadge: {
    position: "absolute",
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.surface}CC`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 5,
  },
  userCountDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginRight: 6 },
  userCountText: { fontSize: 12, color: COLORS.foreground, fontWeight: "500" },
  darkOverlay: {
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  darkOverlayText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: "600",
    backgroundColor: `${COLORS.surface}CC`,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.accent,
    overflow: "hidden",
  },
  // Radius modal
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  radiusSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: "700", color: COLORS.foreground, marginBottom: 4 },
  sheetSubtitle: { fontSize: 14, color: COLORS.muted, marginBottom: 20 },
  radiusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  radiusOptionActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}12` },
  radiusIcon: { fontSize: 24, marginRight: 14 },
  radiusOptionText: { flex: 1 },
  radiusLabel: { fontSize: 15, fontWeight: "600", color: COLORS.foreground },
  radiusDesc: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  radiusCheck: { fontSize: 18, color: COLORS.primary, fontWeight: "700" },
  // Preview modal
  previewBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.7)" },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    overflow: "hidden",
  },
  previewPhotoContainer: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 16,
    position: "relative",
  },
  previewDistanceBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewDistanceText: { fontSize: 11, color: COLORS.primary, fontWeight: "600" },
  previewInfo: { paddingHorizontal: 24 },
  previewName: { fontSize: 24, fontWeight: "700", color: COLORS.foreground, marginBottom: 4 },
  previewAge: { fontSize: 22, fontWeight: "400", color: COLORS.muted },
  previewVenue: { fontSize: 13, color: COLORS.muted, marginBottom: 8 },
  previewBio: { fontSize: 15, color: COLORS.foreground, lineHeight: 22, marginBottom: 12, opacity: 0.85 },
  previewTags: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  previewActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  previewMsgBtn: { flex: 1 },
  previewDismissBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewDismissText: { color: COLORS.muted, fontSize: 15, fontWeight: "600" },
});
