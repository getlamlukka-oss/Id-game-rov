import "react-native-url-polyfill/auto";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigReady = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = createClient(
  supabaseUrl || "https://configuration-required.invalid",
  supabasePublishableKey || "configuration-required",
  {
    auth: {
      ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  },
);

let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

export function startSupabaseAutoRefresh() {
  if (Platform.OS === "web" || appStateSubscription) return;
  appStateSubscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

export function stopSupabaseAutoRefresh() {
  appStateSubscription?.remove();
  appStateSubscription = null;
  supabase.auth.stopAutoRefresh();
}
