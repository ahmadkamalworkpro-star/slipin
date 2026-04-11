import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, NeonButton, DarkInput } from "@/components/slipin-ui";
import { useApp } from "@/lib/app-context";

export default function LoginScreen() {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const ok = await login(email, password);
      if (ok) {
        router.replace("/(tabs)" as any);
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Ambient background glows */}
      <View style={[styles.glowCircle, styles.glowCircle1]} />
      <View style={[styles.glowCircle, styles.glowCircle2]} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo — no box, no background */}
        <View style={styles.logoSection}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>SlipIn</Text>
          <Text style={styles.tagline}>Maybe Meet Now</Text>
        </View>

        {/* Form card */}
        <View style={styles.formCard}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to find who's nearby</Text>

          <View style={styles.fieldGroup}>
            <DarkInput
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <DarkInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <NeonButton
            title={loading ? "Signing In..." : "Sign In"}
            onPress={handleLogin}
            disabled={loading}
            style={styles.primaryBtn}
          />

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <NeonButton
            title="Create Account"
            onPress={() => router.push("/signup" as any)}
            variant="outline"
            color={COLORS.primary}
            style={styles.secondaryBtn}
          />

          <TouchableOpacity
            style={styles.onboardingLink}
            onPress={() => router.push("/onboarding" as any)}
          >
            <Text style={styles.onboardingText}>New here? See how it works →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  glowCircle: {
    position: "absolute",
    borderRadius: 999,
  },
  glowCircle1: {
    width: 380,
    height: 380,
    backgroundColor: COLORS.primary,
    opacity: 0.055,
    top: -120,
    right: -100,
  },
  glowCircle2: {
    width: 280,
    height: 280,
    backgroundColor: COLORS.secondary,
    opacity: 0.055,
    bottom: 80,
    left: -80,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  logo: {
    width: 88,
    height: 88,
    // No background, no border, no box — raw image only
  },
  appName: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.foreground,
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    fontWeight: "300",
  },
  formCard: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.foreground,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginBottom: 28,
    lineHeight: 22,
  },
  fieldGroup: {
    gap: 12,
    marginBottom: 16,
  },
  input: {
    marginBottom: 0,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  primaryBtn: {
    marginBottom: 14,
  },
  forgotBtn: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.muted,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  secondaryBtn: {
    borderColor: COLORS.primary,
    marginBottom: 20,
  },
  onboardingLink: {
    alignItems: "center",
    paddingVertical: 4,
  },
  onboardingText: {
    color: COLORS.muted,
    fontSize: 13,
  },
});
