import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { Card, Heading, PrimaryButton, StateMessage, TextField } from "@/components/Primitives";
import { colors } from "@/theme";

export default function SignInScreen() {
  const { signIn, configReady, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn() {
    setError("");
    setSubmitting(true);
    const message = await signIn(email, password);
    setSubmitting(false);
    if (message) setError(message);
  }

  if (!configReady) {
    return (
      <View style={styles.center}>
        <StateMessage title="ยังไม่ได้ตั้งค่า Supabase" body="คัดลอก mobile/.env.example เป็น mobile/.env แล้วใส่ Project URL และ Publishable Key ของโปรเจกต์เดิม จากนั้นเริ่ม Expo ใหม่" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={styles.mark}><Text style={styles.markText}>R</Text></View>
          <Text style={styles.brandEyebrow}>PERSONAL GAME VAULT</Text>
          <Heading title="ROV ID Manager" subtitle="เข้าสู่ระบบด้วยบัญชีเดิมของคุณ" />
        </View>
        <Card style={styles.formCard}>
          <TextField label="อีเมล" value={email} onChangeText={setEmail} placeholder="name@example.com" autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" returnKeyType="next" />
          <TextField label="รหัสผ่าน" value={password} onChangeText={setPassword} placeholder="รหัสผ่าน" secureTextEntry autoCapitalize="none" autoComplete="current-password" textContentType="password" returnKeyType="done" onSubmitEditing={handleSignIn} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton title="เข้าสู่ระบบ" onPress={handleSignIn} loading={submitting || loading} disabled={!email.trim() || !password} />
          <Text style={styles.hint}>ใช้บัญชี Supabase เดิม ไม่มีการสมัครสมาชิกใหม่จากแอปนี้</Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ivory },
  center: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.ivory },
  content: { flexGrow: 1, justifyContent: "center", padding: 22, gap: 24 },
  brand: { alignItems: "center", gap: 9 },
  mark: { width: 66, height: 66, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.ink, borderRadius: 18, backgroundColor: colors.lime },
  markText: { color: colors.ink, fontSize: 34, fontWeight: "900" },
  brandEyebrow: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  formCard: { gap: 16, padding: 20 },
  error: { borderWidth: 1, borderColor: colors.danger, borderRadius: 10, padding: 10, color: colors.danger, backgroundColor: colors.dangerBg, fontSize: 12, lineHeight: 18 },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center" },
});
