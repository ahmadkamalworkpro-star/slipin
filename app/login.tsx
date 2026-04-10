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
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Background glow */}
        <View style={[styles.glowCircle, styles.glowCircle1]} />
        <View style={[styles.glowCircle, styles.glowCircle2]} />

        {/* Logo */}
        <View style={styles.logoSection}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Maybe Meet Now</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
            style={styles.secondaryBtn}
          />
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  glowCircle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.07,
  },
  glowCircle1: {
    width: 350,
    height: 350,
    backgroundColor: COLORS.primary,
    top: -80,
    right: -80,
  },
  glowCircle2: {
    width: 250,
    height: 250,
    backgroundColor: COLORS.secondary,
    bottom: 100,
    left: -60,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
  },
  tagline: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.muted,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  form: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.foreground,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginBottom: 28,
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
  },
  primaryBtn: {
    marginBottom: 16,
  },
  forgotBtn: {
    alignItems: "center",
    marginBottom: 24,
  },
  forgotText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.muted,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  secondaryBtn: {
    borderColor: COLORS.primary,
  },
});
