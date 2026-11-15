import { Alert, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { Card, Heading, PrimaryButton } from "@/components/Primitives";
import { colors } from "@/theme";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    const message = await signOut();
    if (message) Alert.alert("ออกจากระบบไม่สำเร็จ", message);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Heading eyebrow="ACCOUNT & SECURITY" title="ตั้งค่า" subtitle="ข้อมูลบัญชีและสถานะการเชื่อมต่อ" />
        <Card style={styles.card}>
          <Text style={styles.label}>บัญชีที่เข้าสู่ระบบ</Text>
          <Text selectable style={styles.email}>{user?.email || "ไม่พบอีเมล"}</Text>
          <Text style={styles.caption}>ใช้บัญชีเดียวกับ ROV ID Manager เวอร์ชันเว็บ</Text>
        </Card>
        <Card style={styles.card}>
          <Text style={styles.label}>การเชื่อมต่อข้อมูล</Text>
          <Text style={styles.value}>Supabase · Authenticated RLS</Text>
          <Text style={styles.caption}>แอปใช้ Publishable Key และสิทธิ์ของผู้ใช้ที่เข้าสู่ระบบ ไม่มี Service Role Key ในแอป</Text>
        </Card>
        <PrimaryButton title="ออกจากระบบ" onPress={handleSignOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: 18, gap: 14 },
  card: { gap: 8 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  email: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  value: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  caption: { color: colors.muted, fontSize: 11, lineHeight: 17 },
});
