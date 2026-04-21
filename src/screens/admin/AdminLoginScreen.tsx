import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { NotesAppController } from '../../hooks/useNotesApp';
import { colors, radii } from '../../theme';

export const AdminLoginScreen = ({ app }: { app: NotesAppController }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Admin Access</Text>
      <Text style={styles.sectionCopy}>
        Sign in to an existing admin account or create a new one from this screen.
      </Text>
    </View>

    <View style={styles.card}>
      <View style={styles.modeRow}>
        <Pressable
          onPress={() => app.setAdminLogin((current) => ({ ...current, mode: 'signin' }))}
          style={[styles.modeChip, app.adminLogin.mode === 'signin' && styles.modeChipActive]}
        >
          <Text style={[styles.modeChipText, app.adminLogin.mode === 'signin' && styles.modeChipTextActive]}>
            Sign In
          </Text>
        </Pressable>
        <Pressable
          onPress={() => app.setAdminLogin((current) => ({ ...current, mode: 'signup' }))}
          style={[styles.modeChip, app.adminLogin.mode === 'signup' && styles.modeChipActive]}
        >
          <Text style={[styles.modeChipText, app.adminLogin.mode === 'signup' && styles.modeChipTextActive]}>
            Sign Up
          </Text>
        </Pressable>
      </View>

      <Text style={styles.title}>
        {app.adminLogin.mode === 'signin' ? 'Admin Sign In' : 'Create Admin Account'}
      </Text>
      {app.adminLogin.mode === 'signup' ? (
        <TextInput
          value={app.adminLogin.displayName}
          onChangeText={(displayName) => app.setAdminLogin((current) => ({ ...current, displayName }))}
          style={styles.input}
          placeholder="Admin name"
          placeholderTextColor="#7a8798"
        />
      ) : null}
      <TextInput
        value={app.adminLogin.email}
        onChangeText={(email) => app.setAdminLogin((current) => ({ ...current, email }))}
        style={styles.input}
        placeholder="admin@gmail.com"
        placeholderTextColor="#7a8798"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        value={app.adminLogin.password}
        onChangeText={(password) => app.setAdminLogin((current) => ({ ...current, password }))}
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#7a8798"
        secureTextEntry
      />
      {app.adminLogin.mode === 'signup' ? (
        <TextInput
          value={app.adminLogin.confirmPassword}
          onChangeText={(confirmPassword) => app.setAdminLogin((current) => ({ ...current, confirmPassword }))}
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="#7a8798"
          secureTextEntry
        />
      ) : null}
      <Pressable
        onPress={app.adminLogin.mode === 'signin' ? app.handleAdminLogin : app.handleAdminSignup}
        disabled={app.adminLogin.isSubmitting}
        style={[styles.primaryButton, app.adminLogin.isSubmitting && styles.buttonDisabled]}
      >
        <Text style={styles.primaryButtonText}>
          {app.adminLogin.isSubmitting
            ? app.adminLogin.mode === 'signin'
              ? 'Checking access...'
              : 'Creating admin...'
            : app.adminLogin.mode === 'signin'
              ? 'Login as Admin'
              : 'Create Admin Account'}
        </Text>
      </Pressable>
      <Text style={styles.helper}>
        {app.firebaseReady
          ? app.adminLogin.mode === 'signin'
            ? 'Firebase is configured. Existing admins can sign in here.'
            : 'Firebase is configured. New admin accounts will be created in Auth and an admin profile document will be saved.'
          : 'Firebase config is missing, so real admin signup and login will stay blocked until you add project credentials.'}
      </Text>
      <Text style={styles.demoNote}>
        Demo login still works with `admin@gmail.com` and `admin123`.
      </Text>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 32,
    gap: 14,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  sectionCopy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    padding: 18,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
  },
  modeChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modeChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  modeChipTextActive: {
    color: colors.appBg,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 14,
  },
  helper: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  demoNote: {
    color: '#dbeafe',
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
  },
  primaryButtonText: {
    color: colors.appBg,
    fontWeight: '800',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
