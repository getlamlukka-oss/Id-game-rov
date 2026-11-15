import { Tabs } from "expo-router";
import { colors } from "@/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.ivory },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: "900" },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { height: 66, paddingTop: 7, paddingBottom: 8, backgroundColor: colors.cream, borderTopColor: colors.line },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "800" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "คลังไอดี", tabBarLabel: "คลังไอดี" }} />
      <Tabs.Screen name="categories" options={{ title: "หมวดหมู่", tabBarLabel: "หมวดหมู่" }} />
      <Tabs.Screen name="settings" options={{ title: "ตั้งค่า", tabBarLabel: "ตั้งค่า" }} />
    </Tabs>
  );
}
