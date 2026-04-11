import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#0A0A0F",
  surface: "#12121A",
  card: "#1A1A26",
  neon: "#00F5D4",
  purple: "#B44FFF",
  pink: "#FF2D78",
  text: "#FFFFFF",
  muted: "#8888AA",
  border: "#2A2A3A",
};

const STEPS = [
  {
    id: 1,
    question: "What brings you here?",
    subtitle: "Help us personalize your experience",
    key: "intent",
    options: [
      { label: "Flirt", emoji: "😏" },
      { label: "Make friends", emoji: "🤝" },
      { label: "Casual meet", emoji: "☕" },
      { label: "Dating", emoji: "💘" },
      { label: "See who's nearby", emoji: "📍" },
    ],
  },
  {
    id: 2,
    question: "What kind of vibe are you looking for?",
    subtitle: "Set the tone for your connections",
    key: "vibe",
    options: [
      { label: "Fun", emoji: "🎉" },
      { label: "Chill", emoji: "😌" },
      { label: "Romantic", emoji: "🌹" },
      { label: "Spontaneous", emoji: "⚡" },
      { label: "Open-minded", emoji: "🌊" },
    ],
  },
  {
    id: 3,
    question: "How do you want to appear to others?",
    subtitle: "Choose your presence on the map",
    key: "persona",
    options: [
      { label: "Confident", emoji: "🔥" },
      { label: "Friendly", emoji: "😊" },
      { label: "Private", emoji: "🕶️" },
      { label: "Adventurous", emoji: "🌍" },
    ],
  },
];

export default function OnboardingQuestionsScreen() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const current = STEPS[step];
  const selectedOption = answers[current.key];
  const isLast = step === STEPS.length - 1;

  const handleSelect = (label: string) => {
    setAnswers((prev) => ({ ...prev, [current.key]: label }));
  };

  const handleNext = async () => {
    if (!selectedOption) return;
    if (isLast) {
      // Save answers to AsyncStorage so profile-setup can optionally read them
      try {
        await AsyncStorage.setItem("slipin_onboarding_answers", JSON.stringify(answers));
      } catch {
        // non-critical, continue regardless
      }
      router.replace("/profile-setup" as any);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      router.back();
    } else {
      setStep((s) => s - 1);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-[#0A0A0F]" edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Ambient glow */}
        <View style={[styles.glow, styles.glow1]} />
        <View style={[styles.glow, styles.glow2]} />

        {/* Header row */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>
            {step + 1} / {STEPS.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((step + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>

        {/* Question */}
        <View style={styles.questionBlock}>
          <Text style={styles.question}>{current.question}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsGrid}>
          {current.options.map((opt) => {
            const isSelected = selectedOption === opt.label;
            return (
              <TouchableOpacity
                key={opt.label}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => handleSelect(opt.label)}
                activeOpacity={0.75}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {opt.label}
                </Text>
                {isSelected && <View style={styles.optionCheck} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.nextBtn, !selectedOption && styles.nextBtnDisabled]}
          onPress={handleNext}
          activeOpacity={selectedOption ? 0.8 : 1}
        >
          <Text style={[styles.nextBtnText, !selectedOption && styles.nextBtnTextDisabled]}>
            {isLast ? "Continue to Profile →" : "Next →"}
          </Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={async () => {
            if (isLast) {
              router.replace("/profile-setup" as any);
            } else {
              setStep((s) => s + 1);
            }
          }}
        >
          <Text style={styles.skipText}>Skip this step</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  glow: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.12,
  },
  glow1: {
    width: 260,
    height: 260,
    backgroundColor: COLORS.neon,
    top: -80,
    right: -80,
  },
  glow2: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.purple,
    bottom: 100,
    left: -60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  backText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "500",
  },
  stepIndicator: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
  },
  progressTrack: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 36,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.neon,
    borderRadius: 2,
  },
  questionBlock: {
    marginBottom: 32,
  },
  question: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  optionsGrid: {
    gap: 12,
    marginBottom: 36,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
  },
  optionCardSelected: {
    borderColor: COLORS.neon,
    backgroundColor: "rgba(0, 245, 212, 0.08)",
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionLabel: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: "500",
  },
  optionLabelSelected: {
    color: COLORS.text,
    fontWeight: "600",
  },
  optionCheck: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.neon,
  },
  nextBtn: {
    backgroundColor: COLORS.neon,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: COLORS.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  nextBtnDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    color: COLORS.bg,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  nextBtnTextDisabled: {
    color: COLORS.muted,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipText: {
    color: COLORS.muted,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
