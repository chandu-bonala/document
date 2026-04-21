import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NotesAppController } from '../hooks/useNotesApp';
import { colors, radii } from '../theme';

export const DownloadsScreen = ({ app }: { app: NotesAppController }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Downloads</Text>
      <Text style={styles.sectionCopy}>
        Only successful verified orders appear here. This is the last gate before file access.
      </Text>
    </View>

    {app.purchasedCourses.length === 0 ? (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No unlocked files yet</Text>
        <Text style={styles.emptyCopy}>
          Complete a payment successfully and the course will show up here for download.
        </Text>
      </View>
    ) : (
      app.purchasedCourses.map((order) => {
        const course = app.courses.find((entry) => entry.id === order.courseId);
        return (
          <View key={order.id} style={styles.card}>
            <Text style={styles.title}>{order.courseTitle}</Text>
            <Text style={styles.copy}>Verified purchase for {order.userEmail}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{order.verificationMode === 'demo' ? 'Demo access' : 'Secure access'}</Text>
            </View>
            <Pressable
              onPress={() => app.downloadPurchasedCourse(order.courseId)}
              disabled={app.isDownloading === order.courseId}
              style={[styles.primaryButton, app.isDownloading === order.courseId && styles.buttonDisabled]}
            >
              <Text style={styles.primaryButtonText}>
                {app.isDownloading === order.courseId ? 'Preparing download...' : 'Download PDF'}
              </Text>
            </Pressable>
            <Text style={styles.copy}>
              {course?.fileUrl.startsWith('http')
                ? 'Opens the secured file URL.'
                : 'Using a mock file destination until Firebase Storage is configured.'}
            </Text>
          </View>
        );
      })
    )}
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
  copy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#13243b',
  },
  badgeText: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '700',
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
