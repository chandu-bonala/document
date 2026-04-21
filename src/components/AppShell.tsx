import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NotesAppController } from '../hooks/useNotesApp';
import { colors, radii } from '../theme';

type Props = {
  title: string;
  app: NotesAppController;
  children: ReactNode;
};

const navItems = [
  { label: 'Store', route: { name: 'home' } as const },
  { label: 'Purchases', route: { name: 'purchases' } as const },
  { label: 'Downloads', route: { name: 'downloads' } as const },
  { label: 'Admin', route: { name: 'adminLogin' } as const },
  { label: 'Blueprint', route: { name: 'architecture' } as const },
];

export const AppShell = ({ title, app, children }: Props) => {
  return (
    <View style={styles.shell}>
      <View style={styles.topBar}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {app.demoMode ? <Text style={styles.demoBadge}>Demo payment mode</Text> : null}
        </View>
        <Pressable onPress={app.openAdminPanel} style={styles.adminButton}>
          <Text style={styles.adminButtonText}>Admin Panel</Text>
        </Pressable>
      </View>

      <View style={styles.navRow}>
        {navItems.map((item) => {
          const active = app.route.name === item.route.name;
          return (
            <Pressable
              key={item.label}
              onPress={() => app.navigate(item.route)}
              style={[styles.navChip, active && styles.navChipActive]}
            >
              <Text style={[styles.navChipText, active && styles.navChipTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  demoBadge: {
    color: '#ffd8b3',
    backgroundColor: '#42210b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    fontSize: 12,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 14,
    paddingBottom: 10,
  },
  navChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#22314a',
    backgroundColor: colors.surface,
  },
  navChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  navChipText: {
    color: '#dbe4f0',
    fontSize: 13,
    fontWeight: '700',
  },
  navChipTextActive: {
    color: colors.appBg,
  },
  adminButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: '#16253d',
    borderWidth: 1,
    borderColor: '#294166',
  },
  adminButtonText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
});
