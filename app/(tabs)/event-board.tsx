import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS, UserAvatar } from "@/components/slipin-ui";
import { useApp } from "@/lib/app-context";
import type { Message } from "@/lib/app-context";

const VENUE_NAME = "Madison Square Garden";
const VENUE_ICON = "🏟️";

export default function EventBoardScreen() {
  const { eventMessages, sendEventMessage, nearbyUsers, currentUser } = useApp();
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (eventMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [eventMessages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendEventMessage(trimmed);
    setText("");
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getUserForMessage = (senderId: string) => {
    if (senderId === "me") return currentUser;
    return nearbyUsers.find((u) => u.id === senderId);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === "me";
    const user = getUserForMessage(item.senderId);

    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
        {!isMe && (
          <UserAvatar
            photo={item.senderPhoto}
            name={item.senderName}
            size={30}
            style={styles.msgAvatar}
          />
        )}
        <View style={[styles.msgBubbleWrapper, isMe && styles.msgBubbleWrapperRight]}>
          {!isMe && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleThem]}>
            <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.msgTime, isMe ? styles.msgTimeRight : styles.msgTimeLeft]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        {isMe && (
          <UserAvatar
            photo={currentUser?.photo ?? null}
            name={currentUser?.name ?? "You"}
            size={30}
            style={styles.msgAvatarRight}
          />
        )}
      </View>
    );
  };

  return (
    <ScreenContainer containerClassName="bg-[#0A0A0F]" edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.venueIcon}>{VENUE_ICON}</Text>
          <View>
            <Text style={styles.headerTitle}>{VENUE_NAME}</Text>
            <Text style={styles.headerSubtitle}>
              <Text style={styles.onlineDot}>● </Text>
              {nearbyUsers.length + 1} people here
            </Text>
          </View>
        </View>
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>
          🔒 Messages visible to everyone in this area
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={eventMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyTitle}>Event Board</Text>
              <Text style={styles.emptyText}>
                Say hi to everyone at {VENUE_NAME}!
              </Text>
            </View>
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Say something to the crowd..."
            placeholderTextColor={COLORS.muted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={300}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
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
  backBtn: { marginRight: 12 },
  backText: { fontSize: 22, color: COLORS.foreground },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  venueIcon: { fontSize: 28 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: COLORS.foreground },
  headerSubtitle: { fontSize: 12, color: COLORS.muted },
  onlineDot: { color: COLORS.primary },
  infoBanner: {
    backgroundColor: `${COLORS.secondary}15`,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.secondary}30`,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  infoBannerText: { fontSize: 12, color: COLORS.secondary, textAlign: "center" },
  messagesList: { padding: 16, paddingBottom: 8 },
  msgRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  msgRowRight: { justifyContent: "flex-end" },
  msgRowLeft: { justifyContent: "flex-start" },
  msgAvatar: { marginRight: 8, marginBottom: 4 },
  msgAvatarRight: { marginLeft: 8, marginBottom: 4 },
  msgBubbleWrapper: { maxWidth: "72%" },
  msgBubbleWrapperRight: { alignItems: "flex-end" },
  senderName: { fontSize: 11, color: COLORS.primary, marginBottom: 3, marginLeft: 2 },
  msgBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  msgBubbleMe: {
    backgroundColor: COLORS.secondary,
    borderBottomRightRadius: 4,
  },
  msgBubbleThem: {
    backgroundColor: COLORS.surface2,
    borderBottomLeftRadius: 4,
  },
  msgText: { fontSize: 15, lineHeight: 21 },
  msgTextMe: { color: COLORS.foreground },
  msgTextThem: { color: COLORS.foreground },
  msgTime: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  msgTimeRight: { textAlign: "right" },
  msgTimeLeft: { textAlign: "left" },
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: COLORS.foreground, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surface2,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.foreground,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { fontSize: 20, color: COLORS.foreground, fontWeight: "700" },
});
