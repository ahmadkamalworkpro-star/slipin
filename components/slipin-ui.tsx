import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { InterestTag } from "@/lib/app-context";

// ─── Colors ────────────────────────────────────────────────────────────────────
export const COLORS = {
  bg: "#0A0A0F",
  surface: "#12121A",
  surface2: "#1A1A28",
  primary: "#00F5D4",
  secondary: "#B44FFF",
  accent: "#FF2D78",
  foreground: "#F0F0FF",
  muted: "#7070A0",
  border: "#2A2A40",
  error: "#FF4466",
};

export const TAG_COLORS: Record<InterestTag, string> = {
  Flirt: "#FF2D78",
  Drink: "#B44FFF",
  "Slip Away": "#00F5D4",
  "Hang Out": "#FFB800",
};

// ─── NeonText ──────────────────────────────────────────────────────────────────
export function NeonText({
  children,
  color = COLORS.primary,
  style,
  size = 16,
  bold = false,
}: {
  children: React.ReactNode;
  color?: string;
  style?: TextStyle;
  size?: number;
  bold?: boolean;
}) {
  return (
    <Text
      style={[
        {
          color,
          fontSize: size,
          fontWeight: bold ? "700" : "400",
          textShadowColor: color,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 8,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ─── TagBadge ──────────────────────────────────────────────────────────────────
export function TagBadge({
  tag,
  selected = false,
  onPress,
  small = false,
}: {
  tag: InterestTag;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
}) {
  const color = TAG_COLORS[tag];
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component
      onPress={onPress}
      style={[
        styles.tagBadge,
        small && styles.tagBadgeSmall,
        {
          borderColor: color,
          backgroundColor: selected ? `${color}22` : "transparent",
        },
      ]}
    >
      <Text
        style={[
          styles.tagText,
          small && styles.tagTextSmall,
          { color: selected ? color : COLORS.muted },
        ]}
      >
        {tag}
      </Text>
    </Component>
  );
}

// ─── UserAvatar ────────────────────────────────────────────────────────────────
export function UserAvatar({
  photo,
  name,
  size = 48,
  online = false,
  style,
}: {
  photo: string | null;
  name: string;
  size?: number;
  online?: boolean;
  style?: ViewStyle;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[{ width: size, height: size }, style]}>
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <LinearGradient
          colors={[COLORS.secondary, COLORS.primary]}
          style={[styles.avatarGradient, { width: size, height: size, borderRadius: size / 2 }]}
        >
          <Text style={[styles.avatarInitials, { fontSize: size * 0.35 }]}>{initials}</Text>
        </LinearGradient>
      )}
      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: size * 0.125,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

// ─── NeonButton ────────────────────────────────────────────────────────────────
export function NeonButton({
  title,
  onPress,
  color = COLORS.primary,
  variant = "filled",
  disabled = false,
  style,
  textStyle,
}: {
  title: string;
  onPress: () => void;
  color?: string;
  variant?: "filled" | "outline" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  const filled = variant === "filled";
  const outline = variant === "outline";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[
        styles.neonButton,
        filled && { backgroundColor: color },
        outline && { borderColor: color, borderWidth: 1.5, backgroundColor: "transparent" },
        !filled && !outline && { backgroundColor: "transparent" },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Text
        style={[
          styles.neonButtonText,
          { color: filled ? COLORS.bg : color },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// ─── DarkInput ─────────────────────────────────────────────────────────────────
export function DarkInput({
  style,
  ...props
}: TextInputProps & { style?: ViewStyle }) {
  return (
    <TextInput
      placeholderTextColor={COLORS.muted}
      style={[styles.darkInput, style as TextStyle]}
      {...props}
    />
  );
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
  );
}

// ─── Divider ───────────────────────────────────────────────────────────────────
export function Divider() {
  return <View style={styles.divider} />;
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  tagBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tagTextSmall: {
    fontSize: 11,
  },
  avatarGradient: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: COLORS.bg,
    fontWeight: "700",
  },
  onlineDot: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  neonButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  neonButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  darkInput: {
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.foreground,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: COLORS.muted,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
});
