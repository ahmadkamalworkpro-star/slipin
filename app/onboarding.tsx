import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
  ViewToken,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/components/slipin-ui";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

interface Slide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  accent: string;
  glowColor: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    icon: "📍",
    title: "Discover People\nNearby in Real Time",
    subtitle:
      "SlipIn shows you who's around you right now — at concerts, bars, stadiums, and festivals. No swiping. Just a live map.",
    accent: COLORS.primary,
    glowColor: COLORS.primary,
  },
  {
    id: "2",
    icon: "🌑",
    title: "Control Your\nPrivacy Radius",
    subtitle:
      "Set your visibility from building-level to city-wide. Create Dark Zones near home or work. Go dark anytime with one tap.",
    accent: COLORS.secondary,
    glowColor: COLORS.secondary,
  },
  {
    id: "3",
    icon: "⚡",
    title: "Meet People\nSafely & Instantly",
    subtitle:
      "Connect through the Event Board with everyone at your venue, or slide into a direct message. Real connections, right now.",
    accent: COLORS.accent,
    glowColor: COLORS.accent,
  },
  {
    id: "4",
    icon: "💫",
    title: "Maybe Meet Now",
    subtitle:
      "SlipIn is where spontaneous happens. You're already here. So are they. The rest is up to you.",
    accent: COLORS.primary,
    glowColor: COLORS.primary,
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem("slipin_onboarded", "true");
    router.replace("/signup" as any);
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("slipin_onboarded", "true");
    router.replace("/login" as any);
  };

  const isLast = activeIndex === SLIDES.length - 1;
  const currentSlide = SLIDES[activeIndex];

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      {/* Glow background */}
      <View
        style={[
          styles.glowBg,
          { backgroundColor: item.glowColor },
        ]}
      />

      {/* Icon circle */}
      <View style={[styles.iconCircle, { borderColor: `${item.accent}40`, shadowColor: item.accent }]}>
        <LinearGradient
          colors={[`${item.accent}20`, `${item.accent}05`]}
          style={styles.iconGradient}
        >
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </LinearGradient>
      </View>

      {/* Text content */}
      <View style={styles.textBlock}>
        <Text style={[styles.slideTitle, { color: COLORS.foreground }]}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Deep background gradient */}
      <LinearGradient
        colors={[COLORS.bg, "#0D0D1A", COLORS.bg]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top: Logo + Skip */}
      <View style={styles.topBar}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logoImg}
          resizeMode="contain"
        />
        {!isLast && (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={renderSlide}
        style={styles.flatList}
      />

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isActive
                    ? [styles.dotActive, { backgroundColor: currentSlide.accent, shadowColor: currentSlide.accent }]
                    : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.82}
          style={styles.ctaWrapper}
        >
          <LinearGradient
            colors={
              isLast
                ? [COLORS.primary, "#00C4AA"]
                : [`${currentSlide.accent}CC`, `${currentSlide.accent}88`]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>
              {isLast ? "Get Started" : "Next"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Already have account */}
        {isLast && (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.loginRow}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={{ color: COLORS.primary, fontWeight: "600" }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 8,
  },
  logoImg: {
    width: 44,
    height: 44,
  },
  skipText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "500",
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  glowBg: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.06,
    top: "15%",
    alignSelf: "center",
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    marginBottom: 40,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  iconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 60,
  },
  textBlock: {
    alignItems: "center",
    gap: 16,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: "center",
    gap: 20,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    borderRadius: 4,
    height: 6,
  },
  dotActive: {
    width: 28,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  dotInactive: {
    width: 6,
    backgroundColor: COLORS.border,
  },
  ctaWrapper: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },
  ctaBtn: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.bg,
    letterSpacing: 0.3,
  },
  loginRow: {
    marginTop: -4,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.muted,
  },
});
