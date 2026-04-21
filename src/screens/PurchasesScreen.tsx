import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { NotesAppController } from '../hooks/useNotesApp';
import { colors, radii } from '../theme';
import { formatDateTime, inr } from '../utils/format';

export const PurchasesScreen = ({ app }: { app: NotesAppController }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Purchase Ledger</Text>
      <Text style={styles.sectionCopy}>
        Every successful purchase should become a trusted `orders` record before the file becomes downloadable.
      </Text>
    </View>

    {!app.learner.email ? (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Add learner details first</Text>
        <Text style={styles.emptyCopy}>
          Enter your email during checkout so the app can associate purchases with your account.
        </Text>
      </View>
    ) : app.orders.length === 0 ? (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptyCopy}>
          Once a payment is completed, the order will appear here with its verification status.
        </Text>
      </View>
    ) : (
      app.orders.map((order) => (
        <View key={order.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{order.courseTitle}</Text>
            <Text
              style={[
                styles.status,
                order.status === 'success'
                  ? styles.success
                  : order.status === 'pending'
                    ? styles.pending
                    : styles.failed,
              ]}
            >
              {order.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.meta}>Amount: {inr.format(order.amount)}</Text>
          <Text style={styles.meta}>Payment ID: {order.paymentId}</Text>
          <Text style={styles.meta}>Learner: {order.userName || order.userEmail}</Text>
          <Text style={styles.meta}>Created: {formatDateTime(order.createdAt)}</Text>
          <Text style={styles.mode}>
            {order.verificationMode === 'demo'
              ? 'Demo verification mode'
              : 'Server verification mode'}
          </Text>
        </View>
      ))
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  status: {
    fontSize: 12,
    fontWeight: '800',
  },
  success: {
    color: '#99f6e4',
  },
  pending: {
    color: '#fdba74',
  },
  failed: {
    color: '#fda4af',
  },
  meta: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  mode: {
    color: colors.subtle,
    fontSize: 12,
    fontWeight: '600',
  },
});
