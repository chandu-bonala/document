import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NotesAppController } from '../hooks/useNotesApp';
import { colors, radii } from '../theme';
import { inr } from '../utils/format';

export const CourseDetailScreen = ({ app }: { app: NotesAppController }) => {
  const course = app.selectedCourse;

  if (!course) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Course not found</Text>
        <Text style={styles.emptyCopy}>Choose a course from the store to see its details.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.tagline}>{course.tagline}</Text>
        <Text style={styles.description}>{course.description}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{course.subject}</Text>
          <Text style={styles.meta}>{course.level}</Text>
          <Text style={styles.meta}>{course.pageCount} pages</Text>
          <Text style={styles.meta}>{inr.format(course.price)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What the learner gets</Text>
        {(course.previewPoints ?? []).map((point) => (
          <Text key={point} style={styles.point}>
            • {point}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Access control</Text>
        <Text style={styles.securityCopy}>
          Download stays locked until the order is marked successful after verification. The frontend only starts the
          flow, it should not be trusted as the final source of truth.
        </Text>
        <Pressable onPress={() => app.openCheckout(course.id)} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Proceed to Checkout</Text>
        </Pressable>
        <Pressable onPress={() => app.navigate({ name: 'home' })} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Back to Store</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 32,
    gap: 14,
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
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  tagline: {
    color: colors.accentSoft,
    fontSize: 14,
    fontWeight: '600',
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
  meta: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#16253d',
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  point: {
    color: '#dbeafe',
    fontSize: 14,
    lineHeight: 20,
  },
  securityCopy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
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
});
