import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS, UserAvatar, TagBadge, NeonButton, SectionHeader } from "@/components/slipin-ui";
import { useApp } from "@/lib/app-context";
import type { NearbyUser, InterestTag, GenderType } from "@/lib/app-context";

const INTEREST_TAGS: InterestTag[] = ["Flirt", "Drink", "Slip Away", "Hang Out"];

export default function NearbyScreen() {
  const { nearbyUsers, filters, updateFilters } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);

  const filteredUsers = nearbyUsers.filter((u) => {
    if (u.age < filters.minAge || u.age > filters.maxAge) return false;
    if (filters.hereFor.length > 0 && !u.tags.some((t) => filters.hereFor.includes(t))) return false;
    if (filters.genders.length > 0 && !filters.genders.includes(u.gender)) return false;
    return true;
  });

  const distanceText = (d: number) =>
    d < 1000 ? `${d}m` : `${(d / 1000).toFixed(1)}km`;

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  const renderUser = ({ item }: { item: NearbyUser }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => setSelectedUser(item)}
      activeOpacity={0.8}
    >
      <UserAvatar photo={item.photo} name={item.name} size={56} online />
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName}>{item.name}, {item.age}</Text>
          <Text style={styles.userDistance}>{distanceText(item.distance)}</Text>
        </View>
        <Text style={styles.userGender}>{item.gender}</Text>
        {item.bio ? (
          <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>
        ) : null}
        <View style={styles.userTags}>
          {item.tags.slice(0, 2).map((tag) => (
            <TagBadge key={tag} tag={tag} selected small />
          ))}
        </View>
      </View>
      <View style={styles.userMeta}>
        <Text style={styles.userTime}>{timeAgo(item.lastSeen)}</Text>
        <TouchableOpacity
          style={styles.msgBtn}
          onPress={() => router.push({ pathname: "/(tabs)/chat", params: { userId: item.id } } as any)}
        >
          <Text style={styles.msgBtnText}>💬</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer containerClassName="bg-[#0A0A0F]">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterBtn}>
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.countText}>{filteredUsers.length} people in your area</Text>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌑</Text>
            <Text style={styles.emptyTitle}>No one nearby</Text>
            <Text style={styles.emptySubtitle}>Try expanding your radius or adjusting filters</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        filters={filters}
        onClose={() => setShowFilters(false)}
        onApply={(f) => { updateFilters(f); setShowFilters(false); }}
      />

      {/* User Preview Modal */}
      {selectedUser && (
        <Modal
          visible={!!selectedUser}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedUser(null)}
        >
          <TouchableOpacity
            style={styles.previewBackdrop}
            onPress={() => setSelectedUser(null)}
            activeOpacity={1}
          >
            <View style={styles.previewCard}>
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <View style={styles.previewPhotoSection}>
                  <UserAvatar photo={selectedUser.photo} name={selectedUser.name} size={90} online />
                </View>
                <View style={styles.previewBody}>
                  <Text style={styles.previewName}>
                    {selectedUser.name}, {selectedUser.age}
                  </Text>
                  <Text style={styles.previewGender}>{selectedUser.gender}</Text>
                  {selectedUser.bio ? (
                    <Text style={styles.previewBio}>{selectedUser.bio}</Text>
                  ) : null}
                  <View style={styles.previewTags}>
                    {selectedUser.tags.map((tag) => (
                      <TagBadge key={tag} tag={tag} selected />
                    ))}
                  </View>
                  <View style={styles.previewActions}>
                    <NeonButton
                      title="Message"
                      onPress={() => {
                        setSelectedUser(null);
                        router.push({ pathname: "/(tabs)/chat", params: { userId: selectedUser.id } } as any);
                      }}
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity
                      style={styles.dismissBtn}
                      onPress={() => setSelectedUser(null)}
                    >
                      <Text style={styles.dismissText}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </ScreenContainer>
  );
}

// ─── Filter Modal ──────────────────────────────────────────────────────────────
function FilterModal({
  visible,
  filters,
  onClose,
  onApply,
}: {
  visible: boolean;
  filters: any;
  onClose: () => void;
  onApply: (f: any) => void;
}) {
  const [minAge, setMinAge] = useState(filters.minAge);
  const [maxAge, setMaxAge] = useState(filters.maxAge);
  const [hereFor, setHereFor] = useState<InterestTag[]>(filters.hereFor);
  const [genders, setGenders] = useState<GenderType[]>(filters.genders);

  const TAGS: InterestTag[] = ["Flirt", "Drink", "Slip Away", "Hang Out"];
  const GENDERS: GenderType[] = ["Man", "Woman", "Non-binary", "Other"];

  const toggleHereFor = (t: InterestTag) =>
    setHereFor((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  const toggleGender = (g: GenderType) =>
    setGenders((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.filterBackdrop} onPress={onClose} activeOpacity={1}>
        <View style={styles.filterSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.filterTitle}>Filters</Text>

          <SectionHeader title="Age Range" />
          <View style={styles.ageRow}>
            {[18, 21, 25, 30, 35, 40, 45, 50].map((a) => (
              <TouchableOpacity
                key={`min-${a}`}
                style={[styles.ageBtn, minAge === a && styles.ageBtnActive]}
                onPress={() => setMinAge(a)}
              >
                <Text style={[styles.ageBtnText, minAge === a && { color: COLORS.primary }]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ageLabel}>Min: {minAge} — Max: {maxAge}</Text>
          <View style={styles.ageRow}>
            {[25, 30, 35, 40, 45, 50, 55, 65].map((a) => (
              <TouchableOpacity
                key={`max-${a}`}
                style={[styles.ageBtn, maxAge === a && styles.ageBtnActive]}
                onPress={() => setMaxAge(a)}
              >
                <Text style={[styles.ageBtnText, maxAge === a && { color: COLORS.primary }]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 16 }} />
          <SectionHeader title="Here For" />
          <View style={styles.tagsRow}>
            {TAGS.map((t) => (
              <TagBadge key={t} tag={t} selected={hereFor.includes(t)} onPress={() => toggleHereFor(t)} />
            ))}
          </View>

          <View style={{ height: 16 }} />
          <SectionHeader title="Gender" />
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderChip, genders.includes(g) && styles.genderChipActive]}
                onPress={() => toggleGender(g)}
              >
                <Text style={[styles.genderChipText, genders.includes(g) && { color: COLORS.primary }]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 20 }} />
          <NeonButton
            title="Apply Filters"
            onPress={() => onApply({ minAge, maxAge, hereFor, genders })}
          />
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => onApply({ minAge: 18, maxAge: 65, hereFor: [], genders: [] })}
          >
            <Text style={styles.resetText}>Reset All</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
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
  backBtn: { padding: 4, marginRight: 8 },
  backText: { fontSize: 22, color: COLORS.foreground },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "700", color: COLORS.foreground },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: "600" },
  countText: { fontSize: 13, color: COLORS.muted, paddingHorizontal: 16, paddingVertical: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  userInfo: { flex: 1, marginLeft: 12 },
  userNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  userName: { fontSize: 16, fontWeight: "600", color: COLORS.foreground },
  userDistance: { fontSize: 12, color: COLORS.primary },
  userGender: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  userBio: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  userTags: { flexDirection: "row", marginTop: 6 },
  userMeta: { alignItems: "flex-end", gap: 6 },
  userTime: { fontSize: 11, color: COLORS.muted },
  msgBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  msgBtnText: { fontSize: 16 },
  separator: { height: 1, backgroundColor: COLORS.border },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: COLORS.foreground, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.muted, textAlign: "center" },
  previewBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.7)" },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
  },
  previewPhotoSection: { alignItems: "center", paddingTop: 28, paddingBottom: 16 },
  previewBody: { paddingHorizontal: 24 },
  previewName: { fontSize: 24, fontWeight: "700", color: COLORS.foreground, marginBottom: 2 },
  previewGender: { fontSize: 14, color: COLORS.muted, marginBottom: 8 },
  previewBio: { fontSize: 15, color: COLORS.foreground, lineHeight: 22, marginBottom: 12, opacity: 0.85 },
  previewTags: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  previewActions: { flexDirection: "row", gap: 12 },
  dismissBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dismissText: { color: COLORS.muted, fontSize: 15, fontWeight: "600" },
  filterBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  filterSheet: {
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
  filterTitle: { fontSize: 20, fontWeight: "700", color: COLORS.foreground, marginBottom: 20 },
  ageRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  ageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface2,
  },
  ageBtnActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}15` },
  ageBtnText: { fontSize: 13, color: COLORS.muted, fontWeight: "500" },
  ageLabel: { fontSize: 13, color: COLORS.muted, marginBottom: 8 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap" },
  genderRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genderChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface2,
  },
  genderChipActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}15` },
  genderChipText: { fontSize: 14, color: COLORS.muted, fontWeight: "500" },
  resetBtn: { alignItems: "center", marginTop: 12 },
  resetText: { color: COLORS.muted, fontSize: 14 },
});
