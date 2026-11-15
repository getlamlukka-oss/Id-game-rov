import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Card, Heading, StateMessage } from "@/components/Primitives";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/types";
import { colors } from "@/theme";

type CategoryWithCount = Category & { account_count: number };

export default function CategoriesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [categoryResult, accountResult] = await Promise.all([
      supabase.from("categories").select("id,name,description,cover_image_path").order("name"),
      supabase.from("game_accounts").select("category_id"),
    ]);
    if (categoryResult.error || accountResult.error) {
      setError(categoryResult.error?.message || accountResult.error?.message || "โหลดหมวดหมู่ไม่สำเร็จ");
      setLoading(false);
      return;
    }
    const counts = new Map<string, number>();
    for (const account of accountResult.data ?? []) {
      counts.set(account.category_id, (counts.get(account.category_id) ?? 0) + 1);
    }
    setItems((categoryResult.data ?? []).map((category) => ({
      ...(category as Category),
      account_count: counts.get(category.id) ?? 0,
    })));
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListHeaderComponent={<Heading eyebrow="YOUR COLLECTION" title="หมวดหมู่บัญชี" subtitle="เลือกหมวดหมู่เพื่อกรองคลังไอดี" />}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push({ pathname: "/(tabs)", params: { categoryId: item.id } })} style={({ pressed }) => pressed && styles.pressed}>
          <Card style={styles.categoryCard}>
            <View style={styles.categoryRow}>
              <View style={styles.categoryMark}><Text style={styles.categoryInitial}>{item.name.slice(0, 1)}</Text></View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              </View>
              <View style={styles.count}><Text style={styles.countNumber}>{item.account_count}</Text><Text style={styles.countLabel}>บัญชี</Text></View>
            </View>
          </Card>
        </Pressable>
      )}
      ListEmptyComponent={loading ? <StateMessage title="กำลังโหลดหมวดหมู่" loading /> : <StateMessage title={error ? "โหลดข้อมูลไม่สำเร็จ" : "ยังไม่มีหมวดหมู่"} body={error || "ไม่พบหมวดหมู่ในบัญชีนี้"} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 18, paddingBottom: 28 },
  categoryCard: { padding: 14 },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  categoryMark: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: colors.coral },
  categoryInitial: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  categoryInfo: { flex: 1, gap: 4 },
  categoryName: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  description: { color: colors.muted, fontSize: 11 },
  count: { minWidth: 50, alignItems: "center", borderRadius: 12, padding: 7, backgroundColor: colors.lime },
  countNumber: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  countLabel: { color: colors.ink, fontSize: 9, fontWeight: "800" },
  pressed: { opacity: 0.78 },
});
