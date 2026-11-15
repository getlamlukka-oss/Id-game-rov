import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type PropsWithChildren, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "@/theme";

export function Screen({ children }: PropsWithChildren) {
  return <View style={styles.screen}>{children}</View>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Heading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.heading}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function PrimaryButton({ title, onPress, disabled, loading }: { title: string; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.primaryButton, (disabled || loading) && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      {loading ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.primaryButtonText}>{title}</Text>}
    </Pressable>
  );
}

export function TextField(props: TextInputProps & { label: string }) {
  const { label, style, ...inputProps } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.accent}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

export function StateMessage({ title, body, loading }: { title: string; body?: string; loading?: boolean }) {
  return (
    <View style={styles.state}>
      {loading ? <ActivityIndicator color={colors.accent} /> : null}
      <Text style={styles.stateTitle}>{title}</Text>
      {body ? <Text style={styles.stateBody}>{body}</Text> : null}
    </View>
  );
}

export function Chip({ label, active, onPress, count }: { label: string; active: boolean; onPress: () => void; count?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
    >
      <Text style={styles.chipText}>{label}</Text>
      {count !== undefined ? <Text style={styles.chipCount}>{count}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 16, backgroundColor: colors.cream },
  heading: { gap: 5, marginBottom: 16 },
  eyebrow: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  title: { color: colors.ink, fontSize: 27, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  primaryButton: { minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.ink, borderRadius: radius.control, paddingHorizontal: 18, backgroundColor: colors.lime },
  primaryButtonText: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.82 },
  field: { gap: 7 },
  fieldLabel: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: radius.control, paddingHorizontal: 14, color: colors.ink, backgroundColor: colors.cream, fontSize: 15 },
  state: { minHeight: 150, alignItems: "center", justifyContent: "center", gap: 10, padding: 22 },
  stateTitle: { color: colors.ink, fontSize: 15, fontWeight: "900", textAlign: "center" },
  stateBody: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center" },
  chip: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: 13, backgroundColor: colors.cream },
  chipActive: { borderColor: colors.ink, backgroundColor: colors.lime },
  chipText: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  chipCount: { color: colors.ink, fontSize: 10, fontWeight: "900" },
});
