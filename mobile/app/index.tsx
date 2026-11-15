import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { colors } from "@/theme";

export default function IndexRoute() {
  const { user, loading, configReady } = useAuth();
  if (loading) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.ivory }}><ActivityIndicator color={colors.accent} /></View>;
  }
  if (!configReady || !user) return <Redirect href="/sign-in" />;
  return <Redirect href="/(tabs)" />;
}
