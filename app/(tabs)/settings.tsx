import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS, UserAvatar, SectionHeader, Divider } from "@/components/slipin-ui";
import { useApp } from "@/lib/app-context";

export default function SettingsScreen() {
  const { currentUser, logout, toggleDarkMode } = useApp();

  const isDark = currentUser?.isDark ?? false;

  const SettingRow = ({
    icon,
    label,
    value,
    onPress,
    rightElement,
    danger = false,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightElement}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, danger && { color: COLORS.error }]}>{label}</Text>
      <View style={styles.settingRight}>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        {rightElement}
        {onPress && !rightElement && <Text style={styles.chevron}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer containerClassName="bg-[#0A0A0F]">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push("/profile-setup" as any)}
          activeOpacity={0.8}
        >
          <UserAvatar
            photo={currentUser?.photo ?? null}
            name={currentUser?.name ?? "?"}
            size={60}
            online={!isDark}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser?.name || "Set up profile"}</Text>
            <Text style={styles.profileEmail}>{currentUser?.email}</Text>
            {currentUser?.tags && currentUser.tags.length > 0 && (
              <Text style={styles.profileTags}>
                {currentUser.tags.join(" · ")}
              </Text>
            )}
          </View>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <SectionHeader title="Visibility" />
          <SettingRow
            icon="👁"
            label="Go Dark"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleDarkMode}
                trackColor={{ false: COLORS.border, true: `${COLORS.accent}60` }}
                thumbColor={isDark ? COLORS.accent : COLORS.muted}
              />
            }
          />
          <SettingRow
            icon="🌑"
            label="Dark Zones"
            value="Manage"
            onPress={() => router.push("/dark-zones" as any)}
          />
          <SettingRow
            icon="👻"
            label="Ghost Delay"
            value="15 min"
            onPress={() => router.push("/dark-zones" as any)}
          />
        </View>

        <Divider />

        <View style={styles.section}>
          <SectionHeader title="Location" />
          <SettingRow
            icon="📍"
            label="Radius Level"
            value={currentUser?.radiusLevel ? capitalize(currentUser.radiusLevel) : "Neighborhood"}
            onPress={() => router.push("/(tabs)" as any)}
          />
        </View>

        <Divider />

        <View style={styles.section}>
          <SectionHeader title="Discovery" />
          <SettingRow
            icon="🎯"
            label="Filters"
            value="Age, Interest, Here For"
            onPress={() => router.push("/(tabs)/nearby" as any)}
          />
        </View>

        <Divider />

        <View style={styles.section}>
          <SectionHeader title="Account" />
          <SettingRow
            icon="📧"
            label="Email"
            value={currentUser?.email ?? "—"}
          />
          <SettingRow
            icon="🔒"
            label="Change Password"
            onPress={() => {}}
          />
          <SettingRow
            icon="🗑️"
            label="Delete Account"
            onPress={() => {}}
            danger
          />
        </View>

        <Divider />

        <View style={styles.section}>
          <SectionHeader title="About" />
          <SettingRow icon="📄" label="Terms of Service" onPress={() => {}} />
          <SettingRow icon="🔐" label="Privacy Policy" onPress={() => {}} />
          <SettingRow icon="ℹ️" label="Version" value="1.0.0 (PoC)" />
        </View>

        <Divider />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>SlipIn · Maybe Meet Now</Text>
          <Text style={styles.footerSub}>Proof of Concept v1.0</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: COLORS.foreground },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileInfo: { flex: 1, marginLeft: 14 },
  profileName: { fontSize: 18, fontWeight: "700", color: COLORS.foreground },
  profileEmail: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  profileTags: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  editText: { fontSize: 14, color: COLORS.primary, fontWeight: "600" },
  section: { paddingHorizontal: 16, marginBottom: 4 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingIcon: { fontSize: 20, marginRight: 14, width: 28 },
  settingLabel: { flex: 1, fontSize: 15, color: COLORS.foreground, fontWeight: "500" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingValue: { fontSize: 14, color: COLORS.muted },
  chevron: { fontSize: 20, color: COLORS.muted },
  logoutBtn: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: "center",
  },
  logoutText: { color: COLORS.error, fontSize: 16, fontWeight: "600" },
  footer: { alignItems: "center", paddingVertical: 24 },
  footerText: { fontSize: 13, color: COLORS.muted },
  footerSub: { fontSize: 11, color: COLORS.border, marginTop: 4 },
});
