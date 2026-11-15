import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/auth/AuthProvider";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.ivory },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: "800" },
          contentStyle: { backgroundColor: colors.ivory },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ title: "เข้าสู่ระบบ", presentation: "card" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="accounts/[id]" options={{ title: "รายละเอียดบัญชี" }} />
      </Stack>
    </AuthProvider>
  );
}
