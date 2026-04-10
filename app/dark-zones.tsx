import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS, NeonButton, DarkInput, SectionHeader } from "@/components/slipin-ui";
import { useApp } from "@/lib/app-context";
import type { DarkZone } from "@/lib/app-context";

const PRESET_ZONES: Array<{ label: DarkZone["label"]; icon: string; desc: string }> = [
  { label: "Home", icon: "🏠", desc: "Your home address" },
  { label: "Work", icon: "💼", desc: "Your workplace" },
  { label: "Family House", icon: "👨‍👩‍👧", desc: "Family member's home" },
];

export default function DarkZonesScreen() {
  const { currentUser, toggleDarkMode, darkZones, addDarkZone, removeDarkZone, activateGhostDelay, ghostDelayActive, ghostDelayUntil } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLabel, setAddLabel] = useState<DarkZone["label"]>("Home");
  const [addName, setAddName] = useState("");

  const isDark = currentUser?.isDark ?? false;

  const ghostTimeRemaining = ghostDelayUntil
    ? Math.max(0, Math.ceil((ghostDelayUntil - Date.now()) / 60000))
    : 0;

  const handleAddZone = () => {
    if (!addName.trim()) {
      Alert.alert("Name required", "Please enter a name for this zone");
      return;
    }
    addDarkZone({
      name: addName.trim(),
      label: addLabel,
      latitude: 40.7580 + (Math.random() - 0.5) * 0.1,
      longitude: -73.9855 + (Math.random() - 0.5) * 0.1,
      radius: 200,
    });
    setAddName("");
    setShowAddModal(false);
  };

  return (
    <ScreenContainer containerClassName="bg-[#0A0A0F]">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Dark Zones</Text>
        </View>

        {/* Go Dark master toggle */}
        <View style={styles.goDarkCard}>
          <View style={styles.goDarkLeft}>
            <Text style={styles.goDarkIcon}>🌑</Text>
            <View>
              <Text style={styles.goDarkTitle}>Go Dark</Text>
              <Text style={styles.goDarkDesc}>
                {isDark ? "You are invisible to others" : "You are visible on the map"}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleDarkMode}
            trackColor={{ false: COLORS.border, true: `${COLORS.accent}60` }}
            thumbColor={isDark ? COLORS.accent : COLORS.muted}
          />
        </View>

        {isDark && (
          <View style={styles.darkBanner}>
            <Text style={styles.darkBannerText}>
              🌑 You are currently invisible. Others cannot see you on the map.
            </Text>
          </View>
        )}

        {/* Ghost Delay */}
        <View style={styles.section}>
          <SectionHeader title="Ghost Delay" />
          <View style={styles.ghostCard}>
            <View style={styles.ghostLeft}>
              <Text style={styles.ghostIcon}>👻</Text>
              <View>
                <Text style={styles.ghostTitle}>15-Minute Ghost Delay</Text>
                <Text style={styles.ghostDesc}>
                  {ghostDelayActive
                    ? `Your location will be removed in ~${ghostTimeRemaining} min`
                    : "When you leave an area, your pin stays for 15 minutes"}
                </Text>
              </View>
            </View>
            {!ghostDelayActive ? (
              <TouchableOpacity
                style={styles.ghostActivateBtn}
                onPress={activateGhostDelay}
                activeOpacity={0.8}
              >
                <Text style={styles.ghostActivateText}>Activate</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.ghostActiveIndicator}>
                <View style={styles.ghostActiveDot} />
                <Text style={styles.ghostActiveText}>Active</Text>
              </View>
            )}
          </View>
        </View>

        {/* Dark Zones */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <SectionHeader title="Dark Zones" />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>+ Add Zone</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDesc}>
            You'll automatically go invisible when entering these zones.
          </Text>

          {darkZones.length === 0 ? (
            <View style={styles.emptyZones}>
              <Text style={styles.emptyZonesIcon}>🗺️</Text>
              <Text style={styles.emptyZonesText}>No dark zones set</Text>
              <Text style={styles.emptyZonesSubtext}>
                Add zones where you want automatic privacy
              </Text>
            </View>
          ) : (
            darkZones.map((zone) => (
              <View key={zone.id} style={styles.zoneCard}>
                <Text style={styles.zoneIcon}>
                  {zone.label === "Home" ? "🏠" : zone.label === "Work" ? "💼" : zone.label === "Family House" ? "👨‍👩‍👧" : "📍"}
                </Text>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneLabel}>{zone.label} · {zone.radius}m radius</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeDarkZone(zone.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Preset suggestions */}
        <View style={styles.section}>
          <SectionHeader title="Quick Add" />
          {PRESET_ZONES.map((preset) => {
            const exists = darkZones.some((z) => z.label === preset.label);
            return (
              <TouchableOpacity
                key={preset.label}
                style={[styles.presetCard, exists && styles.presetCardAdded]}
                onPress={() => {
                  if (!exists) {
                    addDarkZone({
                      name: preset.label,
                      label: preset.label,
                      latitude: 40.7580 + (Math.random() - 0.5) * 0.1,
                      longitude: -73.9855 + (Math.random() - 0.5) * 0.1,
                      radius: 200,
                    });
                  }
                }}
                activeOpacity={0.8}
                disabled={exists}
              >
                <Text style={styles.presetIcon}>{preset.icon}</Text>
                <View style={styles.presetInfo}>
                  <Text style={[styles.presetLabel, exists && { color: COLORS.muted }]}>
                    {preset.label}
                  </Text>
                  <Text style={styles.presetDesc}>{preset.desc}</Text>
                </View>
                <Text style={[styles.presetAction, exists && { color: COLORS.muted }]}>
                  {exists ? "Added ✓" : "+ Add"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyNoteText}>
            🔒 Your location data is never shared with third parties. Dark zones are stored locally on your device.
          </Text>
        </View>
      </ScrollView>

      {/* Add Zone Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setShowAddModal(false)}
          activeOpacity={1}
        >
          <View style={styles.addModal}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>Add Dark Zone</Text>

            <SectionHeader title="Zone Type" />
            <View style={styles.labelRow}>
              {(["Home", "Work", "Family House", "Custom"] as DarkZone["label"][]).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.labelChip, addLabel === l && styles.labelChipActive]}
                  onPress={() => setAddLabel(l)}
                >
                  <Text style={[styles.labelChipText, addLabel === l && { color: COLORS.primary }]}>
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 16 }} />
            <SectionHeader title="Zone Name" />
            <DarkInput
              placeholder="e.g. My Apartment, Office, Mom's House"
              value={addName}
              onChangeText={setAddName}
              returnKeyType="done"
              onSubmitEditing={handleAddZone}
            />

            <View style={{ height: 20 }} />
            <NeonButton title="Add Zone" onPress={handleAddZone} />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { marginRight: 12 },
  backText: { fontSize: 22, color: COLORS.foreground },
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.foreground },
  goDarkCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goDarkLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  goDarkIcon: { fontSize: 28 },
  goDarkTitle: { fontSize: 17, fontWeight: "700", color: COLORS.foreground },
  goDarkDesc: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  darkBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: `${COLORS.accent}15`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.accent}40`,
  },
  darkBannerText: { fontSize: 13, color: COLORS.accent, textAlign: "center" },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sectionDesc: { fontSize: 13, color: COLORS.muted, marginBottom: 12 },
  ghostCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ghostLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  ghostIcon: { fontSize: 24 },
  ghostTitle: { fontSize: 15, fontWeight: "600", color: COLORS.foreground },
  ghostDesc: { fontSize: 12, color: COLORS.muted, marginTop: 2, maxWidth: 200 },
  ghostActivateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ghostActivateText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  ghostActiveIndicator: { flexDirection: "row", alignItems: "center", gap: 6 },
  ghostActiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  ghostActiveText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  addBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addBtnText: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
  emptyZones: { alignItems: "center", paddingVertical: 24 },
  emptyZonesIcon: { fontSize: 36, marginBottom: 8 },
  emptyZonesText: { fontSize: 16, color: COLORS.foreground, fontWeight: "600" },
  emptyZonesSubtext: { fontSize: 13, color: COLORS.muted, textAlign: "center", marginTop: 4 },
  zoneCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  zoneIcon: { fontSize: 22, marginRight: 12 },
  zoneInfo: { flex: 1 },
  zoneName: { fontSize: 15, fontWeight: "600", color: COLORS.foreground },
  zoneLabel: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COLORS.error}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: { fontSize: 12, color: COLORS.error, fontWeight: "700" },
  presetCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  presetCardAdded: { opacity: 0.6 },
  presetIcon: { fontSize: 22, marginRight: 12 },
  presetInfo: { flex: 1 },
  presetLabel: { fontSize: 15, fontWeight: "600", color: COLORS.foreground },
  presetDesc: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  presetAction: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  privacyNote: {
    margin: 16,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
  },
  privacyNoteText: { fontSize: 12, color: COLORS.muted, lineHeight: 18, textAlign: "center" },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  addModal: {
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
  modalTitle: { fontSize: 20, fontWeight: "700", color: COLORS.foreground, marginBottom: 20 },
  labelRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  labelChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface2,
  },
  labelChipActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}15` },
  labelChipText: { fontSize: 14, color: COLORS.muted, fontWeight: "500" },
});
