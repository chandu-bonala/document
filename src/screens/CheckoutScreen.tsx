import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { NotesAppController } from '../hooks/useNotesApp';
import { colors, radii } from '../theme';
import { inr } from '../utils/format';

export const CheckoutScreen = ({ app }: { app: NotesAppController }) => {
  const course = app.selectedCourse;

  if (!course) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Nothing to checkout</Text>
        <Text style={styles.emptyCopy}>Choose a course first, then return to checkout.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.sectionHeader}>
        <Text style={styles.heading}>Checkout</Text>
        <Text style={styles.headerCopy}>
          Collect learner info, create the order, and then hand payment verification off to the backend.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.coursePrice}>{inr.format(course.price)}</Text>
        <Text style={styles.helper}>Razorpay UPI payment starts here once the backend order endpoint is configured.</Text>
        {app.authSetupError ? <Text style={styles.warning}>{app.authSetupError}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Learner information</Text>
        <TextInput
          value={app.learner.name}
          onChangeText={(name) => app.setLearner((current) => ({ ...current, name }))}
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#7a8798"
        />
        <TextInput
          value={app.learner.email}
          onChangeText={(email) => app.setLearner((current) => ({ ...current, email }))}
          style={styles.input}
          placeholder="Email for access records"
          placeholderTextColor="#7a8798"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Pressable onPress={app.performCheckout} disabled={app.isCheckingOut} style={[styles.primaryButton, app.isCheckingOut && styles.buttonDisabled]}>
          <Text style={styles.primaryButtonText}>
            {app.isCheckingOut ? 'Processing payment...' : 'Pay and Unlock'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What happens next</Text>
        <Text style={styles.helper}>1. Frontend requests a payment order.</Text>
        <Text style={styles.helper}>2. Razorpay completes UPI payment.</Text>
        <Text style={styles.helper}>3. Backend verifies the signature.</Text>
        <Text style={styles.helper}>4. `orders` record is stored with `success` before downloads unlock.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 32,
    gap: 14,
  },
  sectionHeader: {
    gap: 6,
  },
  heading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  headerCopy: {
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
  emptyCard: {
    padding: 18,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyCopy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  courseTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  coursePrice: {
    color: colors.accentSoft,
    fontSize: 18,
    fontWeight: '700',
  },
  helper: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  warning: {
    color: '#fda4af',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  sectionTitle: {
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
