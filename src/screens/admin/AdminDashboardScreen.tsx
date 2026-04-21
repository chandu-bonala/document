import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NotesAppController } from '../../hooks/useNotesApp';
import { colors, radii } from '../../theme';
import { inr } from '../../utils/format';

export const AdminDashboardScreen = ({ app }: { app: NotesAppController }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Admin Dashboard</Text>
      <Text style={styles.sectionCopy}>
        Manage courses, review publishing status, and move into the upload flow from here.
      </Text>
    </View>

    <View style={styles.metrics}>
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Total courses</Text>
        <Text style={styles.metricValue}>{app.stats.totalCourses}</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Revenue tracked</Text>
        <Text style={styles.metricValue}>{inr.format(app.stats.totalRevenue)}</Text>
      </View>
    </View>

    <View style={styles.actionCard}>
      <Pressable onPress={() => app.navigate({ name: 'uploadCourse' })} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Upload New Course</Text>
      </Pressable>
      <Pressable onPress={app.handleAdminLogout} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Logout</Text>
      </Pressable>
    </View>

    <View style={styles.collectionCard}>
      <Text style={styles.collectionTitle}>Admins Collection</Text>
      <Text style={styles.collectionCopy}>These profiles are loaded from the Firestore `admins` collection.</Text>
      {app.admins.map((admin) => (
        <View key={admin.id} style={styles.collectionRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{admin.displayName}</Text>
            <Text style={styles.copy}>{admin.email}</Text>
          </View>
          <View style={[styles.statusBadge, admin.isDemo ? styles.draftBadge : styles.liveBadge]}>
            <Text style={styles.statusText}>{admin.role}</Text>
          </View>
        </View>
      ))}
    </View>

    <View style={styles.collectionCard}>
      <Text style={styles.collectionTitle}>Courses Collection</Text>
      <Text style={styles.collectionCopy}>These records are loaded from the Firestore `courses` collection.</Text>
    </View>

    {app.courses.map((course) => (
      <View key={course.id} style={styles.courseCard}>
        <View style={styles.row}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{course.title}</Text>
            <Text style={styles.subtitle}>{course.tagline}</Text>
          </View>
          <Text style={styles.price}>{inr.format(course.price)}</Text>
        </View>
        <Text style={styles.copy}>{course.description}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, course.isPublished ? styles.liveBadge : styles.draftBadge]}>
            <Text style={styles.statusText}>{course.isPublished ? 'Published' : 'Hidden'}</Text>
          </View>
          <Pressable onPress={() => app.togglePublish(course.id)} style={styles.toggleButton}>
            <Text style={styles.toggleText}>{course.isPublished ? 'Unpublish' : 'Publish'}</Text>
          </Pressable>
        </View>
      </View>
    ))}
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
  actionCard: {
    padding: 18,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  collectionCard: {
    padding: 18,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  collectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  collectionCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  collectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  courseCard: {
    padding: 18,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
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
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.accentSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  price: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  copy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  liveBadge: {
    backgroundColor: '#122b2a',
  },
  draftBadge: {
    backgroundColor: '#26171c',
  },
  statusText: {
    color: '#f8fafc',
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
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: '#16253d',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  secondaryButtonText: {
    color: '#dbeafe',
    fontWeight: '700',
    fontSize: 14,
  },
  toggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: '#16253d',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  toggleText: {
    color: '#dbeafe',
    fontSize: 13,
    fontWeight: '700',
  },
});
