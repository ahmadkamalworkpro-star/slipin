import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { COLORS, NeonButton, DarkInput } from "@/components/slipin-ui";
import { useApp } from "@/lib/app-context";

export default function SignupScreen() {
  const { signup } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!email || !password || !confirm) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const ok = await signup(email, password);
      if (ok) {
        router.replace("/profile-setup" as any);
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
        <View style={[styles.glowCircle, styles.glowCircle1]} />

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the scene. Find your people.</Text>
        </View>

        <View style={styles.fieldGroup}>
          <DarkInput
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <DarkInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <DarkInput
            placeholder="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignup}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.terms}>
          By creating an account, you agree to our{" "}
          <Text style={styles.termsLink}>Terms of Service</Text> and confirm you are 18+.
        </Text>

        <NeonButton
          title={loading ? "Creating Account..." : "Create Account"}
          onPress={handleSignup}
          disabled={loading}
          style={styles.btn}
        />

        <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={{ color: COLORS.primary }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  glowCircle: { position: "absolute", borderRadius: 999, opacity: 0.07 },
  glowCircle1: {
    width: 300,
    height: 300,
    backgroundColor: COLORS.secondary,
    top: -60,
    left: -60,
  },
  backBtn: { marginBottom: 24 },
  backText: { color: COLORS.muted, fontSize: 15 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.foreground, marginBottom: 6 },
  subtitle: { fontSize: 15, color: COLORS.muted },
  fieldGroup: { gap: 12, marginBottom: 16 },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: 12 },
  terms: { fontSize: 12, color: COLORS.muted, lineHeight: 18, marginBottom: 24 },
  termsLink: { color: COLORS.primary },
  btn: { marginBottom: 20 },
  loginLink: { alignItems: "center" },
  loginLinkText: { color: COLORS.muted, fontSize: 14 },
});
