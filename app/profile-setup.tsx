import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { COLORS, NeonButton, DarkInput, TagBadge, SectionHeader } from "@/components/slipin-ui";
import { useApp } from "@/lib/app-context";
import type { InterestTag, GenderType } from "@/lib/app-context";

const GENDER_OPTIONS: GenderType[] = ["Man", "Woman", "Non-binary", "Other", "Prefer not to say"];
const INTEREST_TAGS: InterestTag[] = ["Flirt", "Drink", "Slip Away", "Hang Out"];

export default function ProfileSetupScreen() {
  const { updateProfile } = useApp();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<GenderType | null>(null);
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [tags, setTags] = useState<InterestTag[]>([]);
  const [error, setError] = useState("");

  const pickPhoto = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow photo access to set a profile picture.");
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const toggleTag = (tag: InterestTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      setError("Please enter a valid age (18+)");
      return;
    }
    if (!gender) {
      setError("Please select your gender");
      return;
    }
    if (tags.length === 0) {
      setError("Please select at least one tag");
      return;
    }
    updateProfile({
      name: name.trim(),
      age: ageNum,
      gender,
      bio: bio.trim(),
      photo,
      tags,
    });
    router.replace("/(tabs)" as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={[styles.glowCircle, styles.glowCircle1]} />

      <View style={styles.header}>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>Let people know who you are</Text>
      </View>

      {/* Photo */}
      <TouchableOpacity style={styles.photoContainer} onPress={pickPhoto} activeOpacity={0.8}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>📷</Text>
            <Text style={styles.photoText}>Add Photo</Text>
          </View>
        )}
        <View style={styles.photoBadge}>
          <Text style={styles.photoBadgeText}>+</Text>
        </View>
      </TouchableOpacity>

      {/* Name & Age */}
      <View style={styles.section}>
        <SectionHeader title="Basic Info" />
        <DarkInput
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <DarkInput
          placeholder="Age (18+)"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          style={styles.input}
        />
      </View>

      {/* Gender */}
      <View style={styles.section}>
        <SectionHeader title="Gender" />
        <View style={styles.genderGrid}>
          {GENDER_OPTIONS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.genderOption,
                gender === g && styles.genderOptionSelected,
              ]}
              onPress={() => setGender(g)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === g && styles.genderTextSelected,
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <SectionHeader title="Bio" />
        <DarkInput
          placeholder="Say something about yourself... (optional)"
          value={bio}
          onChangeText={(t) => setBio(t.slice(0, 150))}
          multiline
          numberOfLines={3}
          style={styles.bioInput as any}
        />
        <Text style={styles.charCount}>{bio.length}/150</Text>
      </View>

      {/* Tags */}
      <View style={styles.section}>
        <SectionHeader title="What I'm Here For" />
        <View style={styles.tagsRow}>
          {INTEREST_TAGS.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              selected={tags.includes(tag)}
              onPress={() => toggleTag(tag)}
            />
          ))}
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <NeonButton title="Save & Enter" onPress={handleSave} style={styles.saveBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  glowCircle: { position: "absolute", borderRadius: 999, opacity: 0.06 },
  glowCircle1: {
    width: 300,
    height: 300,
    backgroundColor: COLORS.primary,
    top: -50,
    right: -80,
  },
  header: { marginBottom: 28 },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.foreground, marginBottom: 6 },
  subtitle: { fontSize: 15, color: COLORS.muted },
  photoContainer: {
    alignSelf: "center",
    marginBottom: 32,
    position: "relative",
  },
  photo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  photoPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.surface2,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  photoIcon: { fontSize: 28, marginBottom: 4 },
  photoText: { fontSize: 12, color: COLORS.muted },
  photoBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  photoBadgeText: { color: COLORS.bg, fontSize: 18, fontWeight: "700", lineHeight: 22 },
  section: { marginBottom: 24 },
  input: { marginBottom: 12 },
  bioInput: { height: 90, textAlignVertical: "top", paddingTop: 12 },
  charCount: { fontSize: 11, color: COLORS.muted, textAlign: "right" },
  genderGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genderOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  genderOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}18`,
  },
  genderText: { fontSize: 14, color: COLORS.muted, fontWeight: "500" },
  genderTextSelected: { color: COLORS.primary },
  tagsRow: { flexDirection: "row", flexWrap: "wrap" },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: 16 },
  saveBtn: { marginTop: 8 },
});
