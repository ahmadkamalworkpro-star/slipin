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
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS, UserAvatar } from "@/components/slipin-ui";
import { useApp } from "@/lib/app-context";
import type { Message } from "@/lib/app-context";

export default function ChatScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { nearbyUsers, conversations, sendMessage, markConversationRead, currentUser } = useApp();
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const user = nearbyUsers.find((u) => u.id === userId);
  const conversation = conversations.find((c) => c.userId === userId);
  const messages = conversation?.messages ?? [];

  useEffect(() => {
    if (userId) markConversationRead(userId);
  }, [userId, markConversationRead]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !userId) return;
    sendMessage(userId, trimmed);
    setText("");
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === "me";
    const showTime = index === messages.length - 1 ||
      messages[index + 1]?.senderId !== item.senderId;

    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
        {!isMe && (
          <UserAvatar
            photo={user?.photo ?? null}
            name={user?.name ?? "?"}
            size={28}
            style={styles.msgAvatar}
          />
        )}
        <View style={styles.msgBubbleWrapper}>
          <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleThem]}>
            <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
              {item.text}
            </Text>
          </View>
          {showTime && (
            <Text style={[styles.msgTime, isMe ? styles.msgTimeRight : styles.msgTimeLeft]}>
              {formatTime(item.timestamp)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <ScreenContainer containerClassName="bg-[#0A0A0F]">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerName}>Chat</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>User not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-[#0A0A0F]" edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <UserAvatar photo={user.photo} name={user.name} size={36} online />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{user.name}</Text>
          <Text style={styles.headerStatus}>
            <Text style={styles.onlineDot}>● </Text>
            Active now
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <UserAvatar photo={user.photo} name={user.name} size={70} />
              <Text style={styles.emptyChatName}>{user.name}</Text>
              <Text style={styles.emptyChatText}>Say something to start the conversation</Text>
              {user.bio ? (
                <View style={styles.emptyChatBio}>
                  <Text style={styles.emptyChatBioText}>"{user.bio}"</Text>
                </View>
              ) : null}
            </View>
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Message..."
            placeholderTextColor={COLORS.muted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
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
  headerInfo: { flex: 1, marginLeft: 10 },
  headerName: { fontSize: 16, fontWeight: "700", color: COLORS.foreground },
  headerStatus: { fontSize: 12, color: COLORS.muted },
  onlineDot: { color: COLORS.primary },
  messagesList: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: "row", marginBottom: 4, alignItems: "flex-end" },
  msgRowRight: { justifyContent: "flex-end" },
  msgRowLeft: { justifyContent: "flex-start" },
  msgAvatar: { marginRight: 8, marginBottom: 4 },
  msgBubbleWrapper: { maxWidth: "75%" },
  msgBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  msgBubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  msgBubbleThem: {
    backgroundColor: COLORS.surface2,
    borderBottomLeftRadius: 4,
  },
  msgText: { fontSize: 15, lineHeight: 21 },
  msgTextMe: { color: COLORS.bg },
  msgTextThem: { color: COLORS.foreground },
  msgTime: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  msgTimeRight: { textAlign: "right" },
  msgTimeLeft: { textAlign: "left" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: COLORS.muted, fontSize: 16 },
  emptyChat: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyChatName: { fontSize: 20, fontWeight: "700", color: COLORS.foreground, marginTop: 16, marginBottom: 8 },
  emptyChatText: { fontSize: 14, color: COLORS.muted, textAlign: "center" },
  emptyChatBio: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyChatBioText: { fontSize: 14, color: COLORS.muted, fontStyle: "italic", textAlign: "center" },
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
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { fontSize: 20, color: COLORS.bg, fontWeight: "700" },
});
