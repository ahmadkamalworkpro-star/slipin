import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type InterestTag = "Flirt" | "Drink" | "Slip Away" | "Hang Out";
export type GenderType = "Man" | "Woman" | "Non-binary" | "Other" | "Prefer not to say";
export type RadiusLevel = "building" | "neighborhood" | "city" | "state";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: GenderType;
  bio: string;
  photo: string | null;
  tags: InterestTag[];
  isOnline: boolean;
  isDark: boolean;
  radiusLevel: RadiusLevel;
}

export interface NearbyUser {
  id: string;
  name: string;
  age: number;
  gender: GenderType;
  bio: string;
  photo: string | null;
  tags: InterestTag[];
  latitude: number;
  longitude: number;
  distance: number; // in meters
  venue?: string;
  lastSeen: number; // timestamp
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  text: string;
  timestamp: number;
}

export interface Conversation {
  userId: string;
  userName: string;
  userPhoto: string | null;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface DarkZone {
  id: string;
  name: string;
  label: "Home" | "Work" | "Family House" | "Custom";
  latitude: number;
  longitude: number;
  radius: number; // meters
}

export interface FilterSettings {
  minAge: number;
  maxAge: number;
  interests: InterestTag[];
  hereFor: InterestTag[];
  genders: GenderType[];
}

interface AppState {
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  nearbyUsers: NearbyUser[];
  conversations: Conversation[];
  eventMessages: Message[];
  darkZones: DarkZone[];
  filters: FilterSettings;
  ghostDelayActive: boolean;
  ghostDelayUntil: number | null;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  toggleDarkMode: () => void;
  setRadiusLevel: (level: RadiusLevel) => void;
  sendMessage: (toUserId: string, text: string) => void;
  sendEventMessage: (text: string) => void;
  addDarkZone: (zone: Omit<DarkZone, "id">) => void;
  removeDarkZone: (id: string) => void;
  updateFilters: (filters: Partial<FilterSettings>) => void;
  activateGhostDelay: () => void;
  getConversation: (userId: string) => Conversation | undefined;
  markConversationRead: (userId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Simulated nearby users for demo
const DEMO_NEARBY_USERS: NearbyUser[] = [
  {
    id: "u1",
    name: "Alexis",
    age: 27,
    gender: "Woman",
    bio: "Here for the vibes and maybe something more 🌙",
    photo: null,
    tags: ["Flirt", "Drink"],
    latitude: 40.7580,
    longitude: -73.9855,
    distance: 120,
    venue: "Madison Square Garden",
    lastSeen: Date.now(),
  },
  {
    id: "u2",
    name: "Jordan",
    age: 30,
    gender: "Man",
    bio: "Concert lover. Always down for an adventure.",
    photo: null,
    tags: ["Hang Out", "Drink"],
    latitude: 40.7575,
    longitude: -73.9860,
    distance: 250,
    venue: "Madison Square Garden",
    lastSeen: Date.now() - 60000,
  },
  {
    id: "u3",
    name: "Riley",
    age: 25,
    gender: "Non-binary",
    bio: "Spontaneous energy. Let's see where the night takes us.",
    photo: null,
    tags: ["Flirt", "Slip Away"],
    latitude: 40.7585,
    longitude: -73.9845,
    distance: 380,
    venue: "Madison Square Garden",
    lastSeen: Date.now() - 120000,
  },
  {
    id: "u4",
    name: "Morgan",
    age: 29,
    gender: "Woman",
    bio: "Festival season is my season. Come find me.",
    photo: null,
    tags: ["Drink", "Hang Out"],
    latitude: 40.7570,
    longitude: -73.9870,
    distance: 500,
    lastSeen: Date.now() - 300000,
  },
  {
    id: "u5",
    name: "Casey",
    age: 32,
    gender: "Man",
    bio: "Just moved to the city. Show me around?",
    photo: null,
    tags: ["Hang Out", "Flirt"],
    latitude: 40.7590,
    longitude: -73.9840,
    distance: 750,
    lastSeen: Date.now() - 600000,
  },
  {
    id: "u6",
    name: "Taylor",
    age: 26,
    gender: "Woman",
    bio: "Night owl. Good music, better company.",
    photo: null,
    tags: ["Slip Away", "Flirt"],
    latitude: 40.7565,
    longitude: -73.9875,
    distance: 900,
    lastSeen: Date.now() - 900000,
  },
];

const DEMO_EVENT_MESSAGES: Message[] = [
  {
    id: "em1",
    senderId: "u1",
    senderName: "Alexis",
    senderPhoto: null,
    text: "Anyone else at the main stage? 🎵",
    timestamp: Date.now() - 300000,
  },
  {
    id: "em2",
    senderId: "u2",
    senderName: "Jordan",
    senderPhoto: null,
    text: "Yeah! Section 112. This set is fire 🔥",
    timestamp: Date.now() - 240000,
  },
  {
    id: "em3",
    senderId: "u3",
    senderName: "Riley",
    senderPhoto: null,
    text: "Meet at the bar after? 🍸",
    timestamp: Date.now() - 180000,
  },
  {
    id: "em4",
    senderId: "u4",
    senderName: "Morgan",
    senderPhoto: null,
    text: "This crowd is everything tonight ✨",
    timestamp: Date.now() - 120000,
  },
];

const DEFAULT_FILTERS: FilterSettings = {
  minAge: 21,
  maxAge: 45,
  interests: [],
  hereFor: [],
  genders: [],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    isAuthenticated: false,
    currentUser: null,
    nearbyUsers: DEMO_NEARBY_USERS,
    conversations: [],
    eventMessages: DEMO_EVENT_MESSAGES,
    darkZones: [],
    filters: DEFAULT_FILTERS,
    ghostDelayActive: false,
    ghostDelayUntil: null,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem("slipin_user");
      if (stored) {
        const user = JSON.parse(stored) as UserProfile;
        setState((prev) => ({ ...prev, isAuthenticated: true, currentUser: user }));
      }
    } catch {
      // ignore
    }
  };

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulate auth
    const user: UserProfile = {
      id: "me",
      email,
      name: "You",
      age: 28,
      gender: "Prefer not to say",
      bio: "",
      photo: null,
      tags: [],
      isOnline: true,
      isDark: false,
      radiusLevel: "neighborhood",
    };
    await AsyncStorage.setItem("slipin_user", JSON.stringify(user));
    setState((prev) => ({ ...prev, isAuthenticated: true, currentUser: user }));
    return true;
  }, []);

  const signup = useCallback(async (email: string, _password: string): Promise<boolean> => {
    const user: UserProfile = {
      id: "me",
      email,
      name: "",
      age: 25,
      gender: "Prefer not to say",
      bio: "",
      photo: null,
      tags: [],
      isOnline: true,
      isDark: false,
      radiusLevel: "neighborhood",
    };
    await AsyncStorage.setItem("slipin_user", JSON.stringify(user));
    setState((prev) => ({ ...prev, isAuthenticated: true, currentUser: user }));
    return true;
  }, []);

  const logout = useCallback(() => {
    AsyncStorage.removeItem("slipin_user");
    setState((prev) => ({ ...prev, isAuthenticated: false, currentUser: null }));
  }, []);

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      const updated = { ...prev.currentUser, ...profile };
      AsyncStorage.setItem("slipin_user", JSON.stringify(updated));
      return { ...prev, currentUser: updated };
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      const isDark = !prev.currentUser.isDark;
      const updated = { ...prev.currentUser, isDark };
      AsyncStorage.setItem("slipin_user", JSON.stringify(updated));
      return { ...prev, currentUser: updated };
    });
  }, []);

  const setRadiusLevel = useCallback((level: RadiusLevel) => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      const updated = { ...prev.currentUser, radiusLevel: level };
      AsyncStorage.setItem("slipin_user", JSON.stringify(updated));
      return { ...prev, currentUser: updated };
    });
  }, []);

  const sendMessage = useCallback((toUserId: string, text: string) => {
    setState((prev) => {
      const user = prev.nearbyUsers.find((u) => u.id === toUserId);
      if (!user) return prev;
      const msg: Message = {
        id: `msg_${Date.now()}`,
        senderId: "me",
        senderName: prev.currentUser?.name || "You",
        senderPhoto: prev.currentUser?.photo || null,
        text,
        timestamp: Date.now(),
      };
      const convs = [...prev.conversations];
      const idx = convs.findIndex((c) => c.userId === toUserId);
      if (idx >= 0) {
        convs[idx] = {
          ...convs[idx],
          messages: [...convs[idx].messages, msg],
          lastMessage: msg,
        };
      } else {
        convs.push({
          userId: toUserId,
          userName: user.name,
          userPhoto: user.photo,
          messages: [msg],
          lastMessage: msg,
          unreadCount: 0,
        });
      }
      // Simulate a reply after 2s
      setTimeout(() => {
        const replies = [
          "Hey! 👋",
          "That sounds fun!",
          "I'm nearby, let's meet!",
          "What are you up to tonight?",
          "I saw you on the map 😏",
        ];
        const reply: Message = {
          id: `msg_${Date.now()}_r`,
          senderId: toUserId,
          senderName: user.name,
          senderPhoto: user.photo,
          text: replies[Math.floor(Math.random() * replies.length)],
          timestamp: Date.now(),
        };
        setState((s) => {
          const cs = [...s.conversations];
          const i = cs.findIndex((c) => c.userId === toUserId);
          if (i >= 0) {
            cs[i] = { ...cs[i], messages: [...cs[i].messages, reply], lastMessage: reply };
          }
          return { ...s, conversations: cs };
        });
      }, 2000);
      return { ...prev, conversations: convs };
    });
  }, []);

  const sendEventMessage = useCallback((text: string) => {
    setState((prev) => {
      const msg: Message = {
        id: `em_${Date.now()}`,
        senderId: "me",
        senderName: prev.currentUser?.name || "You",
        senderPhoto: prev.currentUser?.photo || null,
        text,
        timestamp: Date.now(),
      };
      return { ...prev, eventMessages: [...prev.eventMessages, msg] };
    });
  }, []);

  const addDarkZone = useCallback((zone: Omit<DarkZone, "id">) => {
    setState((prev) => ({
      ...prev,
      darkZones: [...prev.darkZones, { ...zone, id: `dz_${Date.now()}` }],
    }));
  }, []);

  const removeDarkZone = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      darkZones: prev.darkZones.filter((z) => z.id !== id),
    }));
  }, []);

  const updateFilters = useCallback((filters: Partial<FilterSettings>) => {
    setState((prev) => ({ ...prev, filters: { ...prev.filters, ...filters } }));
  }, []);

  const activateGhostDelay = useCallback(() => {
    const until = Date.now() + 15 * 60 * 1000; // 15 minutes
    setState((prev) => ({ ...prev, ghostDelayActive: true, ghostDelayUntil: until }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, ghostDelayActive: false, ghostDelayUntil: null }));
    }, 15 * 60 * 1000);
  }, []);

  const getConversation = useCallback(
    (userId: string) => {
      return state.conversations.find((c) => c.userId === userId);
    },
    [state.conversations],
  );

  const markConversationRead = useCallback((userId: string) => {
    setState((prev) => {
      const convs = prev.conversations.map((c) =>
        c.userId === userId ? { ...c, unreadCount: 0 } : c,
      );
      return { ...prev, conversations: convs };
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        updateProfile,
        toggleDarkMode,
        setRadiusLevel,
        sendMessage,
        sendEventMessage,
        addDarkZone,
        removeDarkZone,
        updateFilters,
        activateGhostDelay,
        getConversation,
        markConversationRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
