import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/auth/AuthProvider";
import { Card, StateMessage } from "@/components/Primitives";
import { supabase } from "@/lib/supabase";
import { parseAccountNotes, type Category, type GameAccount } from "@/types";
import { colors } from "@/theme";

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, loading: authLoading, configReady } = useAuth();
  const [account, setAccount] = useState<GameAccount | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: accountError } = await supabase
      .from("game_accounts")
      .select("id,category_id,game_name,game_id,notes,image_path,created_at")
      .eq("id", id)
      .maybeSingle();

    if (accountError || !data) {
      setError(accountError?.message || "ไม่พบบัญชีนี้ หรือไม่มีสิทธิ์เข้าถึง");
      setAccount(null);
      setCategory(null);
      setLoading(false);
      return;
    }

    const { data: categoryData } = await supabase
      .from("categories")
      .select("id,name,description,cover_image_path")
      .eq("id", data.category_id)
      .maybeSingle();

    setAccount(data as GameAccount);
    setCategory((categoryData as Category | null) ?? null);
    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (authLoading) return <StateMessage title="กำลังตรวจสอบเซสชัน" loading />;
  if (!configReady || !user) return <Redirect href="/sign-in" />;
  if (loading) return <StateMessage title="กำลังโหลดรายละเอียดบัญชี" loading />;
  if (error || !account) return <StateMessage title="เปิดบัญชีนี้ไม่ได้" body={error} />;

  const notes = parseAccountNotes(account.notes);
  const played = category?.name === "ไอดีเล่นแล้ว";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>ROV ACCOUNT DETAIL</Text>
        <Text selectable style={styles.gameId}>{account.game_id}</Text>
        <Text style={styles.gameName}>{account.game_name}</Text>
        <View style={[styles.status, played && styles.statusPlayed]}><Text style={styles.statusText}>{played ? "เล่นแล้ว" : "ยังไม่เล่น"}</Text></View>
      </View>
      <Card style={styles.card}>
        <Text style={styles.label}>หมวดหมู่</Text>
        <Text style={styles.value}>{category?.name || "ไม่พบหมวดหมู่"}</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.label}>หมายเหตุ</Text>
        <Text selectable style={styles.note}>{notes.details || "ไม่มีหมายเหตุ"}</Text>
      </Card>
      <Card style={styles.card}>
        <View style={styles.skinHeader}>
          <Text style={styles.value}>สกินที่มีแล้ว</Text>
          <Text style={styles.skinCount}>{notes.ownedSkins.length} รายการ</Text>
        </View>
        {notes.ownedSkins.length ? notes.ownedSkins.map((skin, index) => (
          <View key={skin + index} style={styles.skinRow}><Text style={styles.skinBullet}>•</Text><Text selectable style={styles.skinText}>{skin}</Text></View>
        )) : <Text style={styles.note}>ไม่มีข้อมูลสกิน</Text>}
      </Card>
      <Text style={styles.footnote}>สร้างเมื่อ {new Date(account.created_at).toLocaleDateString("th-TH")}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 18, gap: 12 },
  hero: { borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 20, backgroundColor: colors.cream, gap: 7 },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: "900", letterSpacing: 1.8 },
  gameId: { color: colors.ink, fontSize: 26, fontWeight: "900" },
  gameName: { color: colors.muted, fontSize: 14, fontWeight: "700" },
  status: { alignSelf: "flex-start", marginTop: 5, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.lime },
  statusPlayed: { backgroundColor: colors.coral },
  statusText: { color: colors.ink, fontSize: 10, fontWeight: "900" },
  card: { gap: 8 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  value: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  note: { color: colors.ink, fontSize: 13, lineHeight: 20 },
  skinHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  skinCount: { color: colors.accent, fontSize: 10, fontWeight: "900" },
  skinRow: { flexDirection: "row", gap: 8, paddingVertical: 5 },
  skinBullet: { color: colors.accent, fontSize: 15, fontWeight: "900" },
  skinText: { flex: 1, color: colors.ink, fontSize: 12, lineHeight: 18 },
  footnote: { paddingVertical: 8, color: colors.muted, fontSize: 10, textAlign: "right" },
});
