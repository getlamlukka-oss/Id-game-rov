import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Card, Chip, Heading, StateMessage } from "@/components/Primitives";
import { supabase } from "@/lib/supabase";
import type { Category, GameAccount } from "@/types";
import { colors } from "@/theme";

type LoadState = "loading" | "ready" | "error";

export default function LibraryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ทั้งหมด" | "เล่นแล้ว" | "ยังไม่เล่น">("ทั้งหมด");
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError("");
    const [categoryResult, accountResult] = await Promise.all([
      supabase.from("categories").select("id,name,description,cover_image_path").order("name"),
      supabase.from("game_accounts").select("id,category_id,game_name,game_id,notes,image_path,created_at").order("created_at", { ascending: false }),
    ]);
    if (categoryResult.error || accountResult.error) {
      setError(categoryResult.error?.message || accountResult.error?.message || "โหลดข้อมูลไม่สำเร็จ");
      setState("error");
      return;
    }
    setCategories((categoryResult.data ?? []) as Category[]);
    setAccounts((accountResult.data ?? []) as GameAccount[]);
    setState("ready");
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  const playedCount = accounts.filter((account) => categoryNames.get(account.category_id) === "ไอดีเล่นแล้ว").length;
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return accounts.filter((account) => {
      const categoryName = categoryNames.get(account.category_id) || "";
      const played = categoryName === "ไอดีเล่นแล้ว";
      const matchesStatus = status === "ทั้งหมด" || (status === "เล่นแล้ว" ? played : !played);
      const matchesCategory = !params.categoryId || account.category_id === params.categoryId;
      const matchesSearch = !term || [account.game_id, account.game_name, account.notes, categoryName].some((value) => value?.toLocaleLowerCase().includes(term));
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [accounts, categoryNames, params.categoryId, search, status]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  function renderAccount({ item }: { item: GameAccount }) {
    const categoryName = categoryNames.get(item.category_id) || "ไม่มีหมวดหมู่";
    const played = categoryName === "ไอดีเล่นแล้ว";
    return (
      <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/accounts/[id]", params: { id: item.id } })} style={({ pressed }) => [styles.accountPressable, pressed && styles.pressed]}>
        <Card style={styles.accountCard}>
          <View style={styles.accountTop}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.game_name.trim().slice(0, 1).toUpperCase() || "R"}</Text></View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountEyebrow}>ROV ACCOUNT</Text>
              <Text style={styles.accountId}>{item.game_id}</Text>
              <Text style={styles.accountName} numberOfLines={1}>{item.game_name}</Text>
            </View>
            <View style={[styles.status, played && styles.statusPlayed]}><Text style={styles.statusText}>{played ? "เล่นแล้ว" : "ยังไม่เล่น"}</Text></View>
          </View>
          <View style={styles.accountBottom}>
            <Text style={styles.categoryName}>{categoryName}</Text>
            <Text style={styles.openLabel}>ดูรายละเอียด  ›</Text>
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderAccount}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListHeaderComponent={
        <View>
          <View style={styles.hero}>
            <Text style={styles.heroEyebrow}>YOUR ROV COLLECTION</Text>
            <Text style={styles.heroTitle}>คลังไอดีของคุณ</Text>
            <Text style={styles.heroSubtitle}>จัดการบัญชีเกมทั้งหมดในที่เดียว</Text>
          </View>
          <View style={styles.metrics}>
            <Metric label="บัญชีทั้งหมด" value={accounts.length} tone={styles.metricLime} />
            <Metric label="เล่นแล้ว" value={playedCount} tone={styles.metricCoral} />
            <Metric label="ยังไม่เล่น" value={accounts.length - playedCount} tone={styles.metricCream} />
          </View>
          <Heading eyebrow="FIND YOUR ACCOUNT" title="ค้นหาไอดีเกม" subtitle={filtered.length + " รายการ"} />
          <TextInput value={search} onChangeText={setSearch} placeholder="รหัสไอดี ชื่อตัวละคร หรือหมายเหตุ" placeholderTextColor={colors.muted} style={styles.search} returnKeyType="search" />
          <View style={styles.chips}>
            {(["ทั้งหมด", "เล่นแล้ว", "ยังไม่เล่น"] as const).map((item) => <Chip key={item} label={item} active={status === item} onPress={() => setStatus(item)} />)}
          </View>
          {params.categoryId ? (
            <Pressable onPress={() => router.setParams({ categoryId: undefined })} style={styles.clearFilter}><Text style={styles.clearFilterText}>ล้างตัวกรองหมวดหมู่ ×</Text></Pressable>
          ) : null}
          <View style={styles.listHeading}><Text style={styles.listTitle}>บัญชี ROV</Text><Text style={styles.listCount}>{filtered.length} รายการ</Text></View>
          {state === "loading" ? <StateMessage title="กำลังโหลดคลังไอดี" loading /> : null}
          {state === "error" ? <StateMessage title="โหลดข้อมูลไม่สำเร็จ" body={error} /> : null}
        </View>
      }
      ListEmptyComponent={state === "ready" ? <StateMessage title="ไม่พบไอดีที่ตรงกัน" body="ลองเปลี่ยนคำค้นหาหรือตัวกรอง" /> : null}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    />
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: object }) {
  return <View style={[styles.metric, tone]}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 18, paddingBottom: 28 },
  hero: { minHeight: 145, justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 24, padding: 20, backgroundColor: colors.cream },
  heroEyebrow: { color: colors.accent, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  heroTitle: { marginTop: 10, color: colors.ink, fontSize: 27, fontWeight: "900", letterSpacing: -0.8 },
  heroSubtitle: { marginTop: 5, color: colors.muted, fontSize: 12 },
  metrics: { flexDirection: "row", gap: 8, marginTop: 12, marginBottom: 26 },
  metric: { flex: 1, minHeight: 75, justifyContent: "center", gap: 6, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 11 },
  metricLime: { backgroundColor: colors.lime },
  metricCoral: { backgroundColor: colors.coral },
  metricCream: { backgroundColor: colors.cream },
  metricLabel: { color: colors.ink, fontSize: 9, fontWeight: "900" },
  metricValue: { color: colors.ink, fontSize: 23, fontWeight: "900" },
  search: { minHeight: 50, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 14, backgroundColor: colors.cream, color: colors.ink, fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12, marginBottom: 18 },
  clearFilter: { alignSelf: "flex-start", marginBottom: 12, paddingVertical: 7 },
  clearFilterText: { color: colors.accent, fontSize: 12, fontWeight: "800" },
  listHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  listTitle: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  listCount: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  accountPressable: { borderRadius: 20 },
  accountCard: { padding: 14 },
  accountTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.ink, borderRadius: 17, backgroundColor: colors.lime },
  avatarText: { color: colors.ink, fontSize: 23, fontWeight: "900" },
  accountInfo: { flex: 1, minWidth: 0 },
  accountEyebrow: { color: colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 1.4 },
  accountId: { marginTop: 3, color: colors.ink, fontSize: 16, fontWeight: "900" },
  accountName: { marginTop: 2, color: colors.muted, fontSize: 11, fontWeight: "700" },
  status: { borderWidth: 1, borderColor: colors.line, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: colors.lime },
  statusPlayed: { backgroundColor: colors.coral },
  statusText: { color: colors.ink, fontSize: 9, fontWeight: "900" },
  accountBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 13, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line },
  categoryName: { color: colors.ink, fontSize: 11, fontWeight: "800" },
  openLabel: { color: colors.accent, fontSize: 10, fontWeight: "900" },
  pressed: { opacity: 0.78 },
});
