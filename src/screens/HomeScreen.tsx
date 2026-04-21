import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NotesAppController } from '../hooks/useNotesApp';
import { colors, radii } from '../theme';
import { inr } from '../utils/format';

export const HomeScreen = ({ app }: { app: NotesAppController }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Course Catalog</Text>
      <Text style={styles.sectionCopy}>
        Users can browse published notes, inspect the details, and move into checkout from here.
      </Text>
    </View>

    <View style={styles.quickActions}>
      <Pressable onPress={app.openAdminPanel} style={styles.adminShortcut}>
        <Text style={styles.adminShortcutLabel}>Go to Admin Panel</Text>
        <Text style={styles.adminShortcutCopy}>Manage uploads, pricing, and publishing</Text>
      </Pressable>
    </View>

    <View style={styles.metrics}>
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Published courses</Text>
        <Text style={styles.metricValue}>{app.stats.publishedCourses}</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Unlocked by you</Text>
        <Text style={styles.metricValue}>{app.purchasedCourses.length}</Text>
      </View>
    </View>

    {app.isLoadingCourses ? (
      <View style={styles.feedbackCard}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loading}>Loading published courses...</Text>
      </View>
    ) : (
      app.publishedCourses.map((course) => {
        const unlocked = app.purchaseMap.has(course.id);
        return (
          <Pressable key={course.id} onPress={() => app.openCourse(course.id)} style={styles.courseCard}>
            <View style={styles.row}>
              <View style={styles.headerText}>
                <Text style={styles.title}>{course.title}</Text>
                <Text style={styles.subtitle}>{course.tagline}</Text>
              </View>
              <Text style={styles.price}>{inr.format(course.price)}</Text>
            </View>
            <Text style={styles.description}>{course.description}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.pill}>{course.subject}</Text>
              <Text style={styles.pill}>{course.level}</Text>
              <Text style={styles.pill}>{course.pageCount} pages</Text>
            </View>
            <Text style={[styles.unlockStatus, unlocked && styles.unlockStatusOn]}>
              {unlocked ? 'Unlocked' : 'Locked until payment verification'}
            </Text>
          </Pressable>
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
  quickActions: {
    gap: 12,
  },
  adminShortcut: {
    padding: 18,
    borderRadius: radii.xl,
    backgroundColor: '#121f36',
    borderWidth: 1,
    borderColor: '#274268',
    gap: 6,
  },
  adminShortcutLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  adminShortcutCopy: {
    color: '#c7d2de',
    fontSize: 14,
    lineHeight: 20,
  },
  metrics: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metricCard: {
    minWidth: 190,
    padding: 18,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  metricValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  loading: {
    color: colors.muted,
    textAlign: 'center',
  },
  feedbackCard: {
    padding: 18,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  courseCard: {
    padding: 18,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.accentSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  price: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    color: '#c7d2de',
    fontSize: 14,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#16253d',
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '600',
  },
  unlockStatus: {
    color: '#fdba74',
    fontSize: 13,
    fontWeight: '700',
  },
  unlockStatusOn: {
    color: '#99f6e4',
  },
});
