import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { NotesAppController } from '../hooks/useNotesApp';
import { colors, radii } from '../theme';

export const ArchitectureScreen = ({ app }: { app: NotesAppController }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Project Blueprint</Text>
      <Text style={styles.sectionCopy}>
        This screen captures how the complete application is meant to work across frontend, Firebase, and payment
        verification.
      </Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.title}>Frontend responsibilities</Text>
      <Text style={styles.item}>• Browse published courses</Text>
      <Text style={styles.item}>• Start checkout with learner details</Text>
      <Text style={styles.item}>• Show purchases and downloads only after success</Text>
      <Text style={styles.item}>• Let admin upload and manage PDFs</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.title}>Backend responsibilities</Text>
      <Text style={styles.item}>• Create Razorpay orders with secret key</Text>
      <Text style={styles.item}>• Verify Razorpay payment signature</Text>
      <Text style={styles.item}>• Write trusted order records to Firestore</Text>
      <Text style={styles.item}>• Return download permission only for paid users</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.title}>Current runtime status</Text>
      <Text style={styles.item}>Firebase configured: {app.firebaseReady ? 'Yes' : 'No'}</Text>
      <Text style={styles.item}>Payment verification endpoint: {app.demoMode ? 'Demo mode active' : 'Configured'}</Text>
      <Text style={styles.warning}>
        Never trust frontend success alone. Unlocking should follow backend verification, not button clicks.
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
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  item: {
    color: '#dbeafe',
    fontSize: 14,
    lineHeight: 20,
  },
  warning: {
    color: '#fed7aa',
    fontSize: 14,
    lineHeight: 21,
  },
});
