import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, Font, Radius, Spacing } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  error?: string | null;
  /** Affiche l'œil pour révéler le mot de passe */
  password?: boolean;
};

export const Field = forwardRef<TextInput, Props>(function Field(
  { label, icon, error, password = false, style, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(password);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, focused && styles.boxFocused, !!error && styles.boxError]}>
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? Colors.primary : Colors.inkFaint}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={Colors.inkFaint}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, style]}
          {...rest}
        />
        {password ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={19} color={Colors.inkFaint} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.lg },
  label: {
    fontFamily: Font.medium,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.inkMuted,
    marginBottom: 6,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.lg,
  },
  boxFocused: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  boxError: { borderColor: Colors.danger, backgroundColor: Colors.dangerSoft },
  icon: { marginRight: Spacing.md },
  input: {
    flex: 1,
    fontFamily: Font.regular,
    fontSize: 15,
    color: Colors.ink,
    // padding à 0 : Android ajoute sinon un padding vertical qui décentre le texte
    paddingVertical: 0,
  },
  error: {
    fontFamily: Font.regular,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.danger,
    marginTop: 5,
  },
});
