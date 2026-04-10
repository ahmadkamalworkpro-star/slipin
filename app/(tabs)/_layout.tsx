import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View, Text } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { COLORS } from "@/components/slipin-ui";
import { useApp } from "@/lib/app-context";

function TabIcon({ name, focused, icon }: { name: string; focused: boolean; icon: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { conversations } = useApp();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={24} name="map.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: "Nearby",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.2.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="event-board"
        options={{
          title: "Event",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="bubble.left.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="message.fill" color={color} />
          ),
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.accent, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
