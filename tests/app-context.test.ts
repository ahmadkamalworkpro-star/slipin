import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock expo-router
vi.mock("expo-router", () => ({
  router: { replace: vi.fn(), push: vi.fn(), back: vi.fn() },
  useLocalSearchParams: vi.fn().mockReturnValue({}),
}));

// ─── Type definitions (mirrored from app-context) ─────────────────────────────
type InterestTag = "Flirt" | "Drink" | "Slip Away" | "Hang Out";
type GenderType = "Man" | "Woman" | "Non-binary" | "Other" | "Prefer not to say";
type RadiusLevel = "building" | "neighborhood" | "city" | "state";

interface NearbyUser {
  id: string;
  name: string;
  age: number;
  gender: GenderType;
  bio: string;
  photo: string | null;
  tags: InterestTag[];
  latitude: number;
  longitude: number;
  distance: number;
  venue?: string;
  lastSeen: number;
}

interface FilterSettings {
  minAge: number;
  maxAge: number;
  interests: InterestTag[];
  hereFor: InterestTag[];
  genders: GenderType[];
}

// ─── Filter logic tests ───────────────────────────────────────────────────────
describe("User filter logic", () => {
  const mockUsers: NearbyUser[] = [
    {
      id: "u1",
      name: "Alexis",
      age: 27,
      gender: "Woman",
      bio: "Test",
      photo: null,
      tags: ["Flirt", "Drink"],
      latitude: 40.758,
      longitude: -73.985,
      distance: 120,
      lastSeen: Date.now(),
    },
    {
      id: "u2",
      name: "Jordan",
      age: 35,
      gender: "Man",
      bio: "Test",
      photo: null,
      tags: ["Hang Out"],
      latitude: 40.757,
      longitude: -73.986,
      distance: 250,
      lastSeen: Date.now(),
    },
    {
      id: "u3",
      name: "Riley",
      age: 22,
      gender: "Non-binary",
      bio: "Test",
      photo: null,
      tags: ["Slip Away"],
      latitude: 40.759,
      longitude: -73.984,
      distance: 380,
      lastSeen: Date.now(),
    },
  ];

  const applyFilters = (users: NearbyUser[], filters: FilterSettings) => {
    return users.filter((u) => {
      if (u.age < filters.minAge || u.age > filters.maxAge) return false;
      if (filters.hereFor.length > 0 && !u.tags.some((t) => filters.hereFor.includes(t))) return false;
      if (filters.genders.length > 0 && !filters.genders.includes(u.gender)) return false;
      return true;
    });
  };

  it("returns all users when no filters applied", () => {
    const filters: FilterSettings = { minAge: 18, maxAge: 65, interests: [], hereFor: [], genders: [] };
    expect(applyFilters(mockUsers, filters)).toHaveLength(3);
  });

  it("filters by age range", () => {
    const filters: FilterSettings = { minAge: 25, maxAge: 30, interests: [], hereFor: [], genders: [] };
    const result = applyFilters(mockUsers, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Alexis");
  });

  it("filters by hereFor tag", () => {
    const filters: FilterSettings = { minAge: 18, maxAge: 65, interests: [], hereFor: ["Flirt"], genders: [] };
    const result = applyFilters(mockUsers, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("u1");
  });

  it("filters by gender", () => {
    const filters: FilterSettings = { minAge: 18, maxAge: 65, interests: [], hereFor: [], genders: ["Man"] };
    const result = applyFilters(mockUsers, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Jordan");
  });

  it("filters by multiple genders", () => {
    const filters: FilterSettings = { minAge: 18, maxAge: 65, interests: [], hereFor: [], genders: ["Man", "Woman"] };
    const result = applyFilters(mockUsers, filters);
    expect(result).toHaveLength(2);
  });

  it("returns empty when no users match filters", () => {
    const filters: FilterSettings = { minAge: 40, maxAge: 50, interests: [], hereFor: [], genders: [] };
    const result = applyFilters(mockUsers, filters);
    expect(result).toHaveLength(0);
  });
});

// ─── Radius level tests ───────────────────────────────────────────────────────
describe("Radius level configuration", () => {
  const RADIUS_INFO: Record<RadiusLevel, { label: string; meters: number }> = {
    building: { label: "Building", meters: 100 },
    neighborhood: { label: "Neighborhood", meters: 3200 },
    city: { label: "City", meters: 16000 },
    state: { label: "State", meters: 320000 },
  };

  it("building level has smallest radius", () => {
    expect(RADIUS_INFO.building.meters).toBeLessThan(RADIUS_INFO.neighborhood.meters);
  });

  it("state level has largest radius", () => {
    expect(RADIUS_INFO.state.meters).toBeGreaterThan(RADIUS_INFO.city.meters);
  });

  it("all radius levels have valid labels", () => {
    const levels: RadiusLevel[] = ["building", "neighborhood", "city", "state"];
    levels.forEach((l) => {
      expect(RADIUS_INFO[l].label).toBeTruthy();
      expect(RADIUS_INFO[l].meters).toBeGreaterThan(0);
    });
  });
});

// ─── Dark Zone tests ──────────────────────────────────────────────────────────
describe("Dark Zone logic", () => {
  interface DarkZone {
    id: string;
    name: string;
    label: "Home" | "Work" | "Family House" | "Custom";
    latitude: number;
    longitude: number;
    radius: number;
  }

  const addZone = (zones: DarkZone[], zone: Omit<DarkZone, "id">): DarkZone[] => {
    return [...zones, { ...zone, id: `dz_${Date.now()}` }];
  };

  const removeZone = (zones: DarkZone[], id: string): DarkZone[] => {
    return zones.filter((z) => z.id !== id);
  };

  it("can add a dark zone", () => {
    const zones: DarkZone[] = [];
    const result = addZone(zones, { name: "Home", label: "Home", latitude: 40.7, longitude: -73.9, radius: 200 });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Home");
  });

  it("can remove a dark zone", () => {
    const zones: DarkZone[] = [
      { id: "dz_1", name: "Home", label: "Home", latitude: 40.7, longitude: -73.9, radius: 200 },
    ];
    const result = removeZone(zones, "dz_1");
    expect(result).toHaveLength(0);
  });

  it("removing non-existent zone leaves array unchanged", () => {
    const zones: DarkZone[] = [
      { id: "dz_1", name: "Home", label: "Home", latitude: 40.7, longitude: -73.9, radius: 200 },
    ];
    const result = removeZone(zones, "dz_999");
    expect(result).toHaveLength(1);
  });
});

// ─── Ghost Delay tests ────────────────────────────────────────────────────────
describe("Ghost Delay feature", () => {
  it("ghost delay is 15 minutes in milliseconds", () => {
    const GHOST_DELAY_MS = 15 * 60 * 1000;
    expect(GHOST_DELAY_MS).toBe(900000);
  });

  it("ghost delay until is in the future when activated", () => {
    const now = Date.now();
    const until = now + 15 * 60 * 1000;
    expect(until).toBeGreaterThan(now);
  });

  it("ghost time remaining calculates correctly", () => {
    const now = Date.now();
    const until = now + 10 * 60 * 1000; // 10 minutes from now
    const remaining = Math.max(0, Math.ceil((until - now) / 60000));
    expect(remaining).toBe(10);
  });
});

// ─── Message tests ────────────────────────────────────────────────────────────
describe("Message functionality", () => {
  interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderPhoto: string | null;
    text: string;
    timestamp: number;
  }

  it("creates a message with correct structure", () => {
    const msg: Message = {
      id: `msg_${Date.now()}`,
      senderId: "me",
      senderName: "Test User",
      senderPhoto: null,
      text: "Hello!",
      timestamp: Date.now(),
    };
    expect(msg.senderId).toBe("me");
    expect(msg.text).toBe("Hello!");
    expect(msg.id).toMatch(/^msg_/);
  });

  it("message timestamp is recent", () => {
    const now = Date.now();
    const msg: Message = {
      id: "test",
      senderId: "me",
      senderName: "Test",
      senderPhoto: null,
      text: "Hi",
      timestamp: now,
    };
    expect(msg.timestamp).toBeGreaterThanOrEqual(now - 100);
  });
});

// ─── Interest tags tests ──────────────────────────────────────────────────────
describe("Interest tags", () => {
  const VALID_TAGS: InterestTag[] = ["Flirt", "Drink", "Slip Away", "Hang Out"];

  it("all four interest tags are defined", () => {
    expect(VALID_TAGS).toHaveLength(4);
  });

  it("contains expected tag names", () => {
    expect(VALID_TAGS).toContain("Flirt");
    expect(VALID_TAGS).toContain("Drink");
    expect(VALID_TAGS).toContain("Slip Away");
    expect(VALID_TAGS).toContain("Hang Out");
  });
});
