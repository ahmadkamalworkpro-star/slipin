import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated, Dimensions } from "react-native";
import { router } from "expo-router";
import { COLORS } from "@/components/slipin-ui";
import { useApp } from "@/lib/app-context";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const { isAuthenticated, currentUser } = useApp();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      if (isAuthenticated && currentUser?.name) {
        router.replace("/(tabs)");
      } else if (isAuthenticated) {
        router.replace("/profile-setup");
      } else {
        router.replace("/login");
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [isAuthenticated, currentUser]);

  return (
    <View style={styles.container}>
      {/* Background gradient circles */}
      <View style={[styles.glowCircle, styles.glowCircle1]} />
      <View style={[styles.glowCircle, styles.glowCircle2]} />

      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={{ opacity: taglineOpacity, alignItems: "center" }}>
        <Text style={styles.tagline}>Maybe Meet Now</Text>
        <View style={styles.taglineLine} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  glowCircle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.08,
  },
  glowCircle1: {
    width: 400,
    height: 400,
    backgroundColor: COLORS.primary,
    top: -100,
    left: -100,
  },
  glowCircle2: {
    width: 300,
    height: 300,
    backgroundColor: COLORS.secondary,
    bottom: -50,
    right: -50,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 200,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.muted,
    letterSpacing: 3,
    fontWeight: "300",
    textTransform: "uppercase",
  },
  taglineLine: {
    marginTop: 12,
    width: 60,
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
});
