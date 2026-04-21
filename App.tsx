import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AppShell } from './src/components/AppShell';
import { ArchitectureScreen } from './src/screens/ArchitectureScreen';
import { CourseDetailScreen } from './src/screens/CourseDetailScreen';
import { DownloadsScreen } from './src/screens/DownloadsScreen';
import { AdminDashboardScreen } from './src/screens/admin/AdminDashboardScreen';
import { AdminLoginScreen } from './src/screens/admin/AdminLoginScreen';
import { UploadCourseScreen } from './src/screens/admin/UploadCourseScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PurchasesScreen } from './src/screens/PurchasesScreen';
import { useNotesApp } from './src/hooks/useNotesApp';
import { AppRouteName } from './src/types';

const titles: Record<AppRouteName, string> = {
  home: 'Store',
  detail: 'Course Details',
  checkout: 'Checkout',
  purchases: 'Purchases',
  downloads: 'Downloads',
  adminLogin: 'Admin Login',
  adminDashboard: 'Admin Dashboard',
  uploadCourse: 'Upload Course',
  architecture: 'Project Blueprint',
};

export default function App() {
  const app = useNotesApp();

  const renderScreen = () => {
    switch (app.route.name) {
      case 'home':
        return <HomeScreen app={app} />;
      case 'detail':
        return <CourseDetailScreen app={app} />;
      case 'checkout':
        return <CheckoutScreen app={app} />;
      case 'purchases':
        return <PurchasesScreen app={app} />;
      case 'downloads':
        return <DownloadsScreen app={app} />;
      case 'adminLogin':
        return <AdminLoginScreen app={app} />;
      case 'adminDashboard':
        return <AdminDashboardScreen app={app} />;
      case 'uploadCourse':
        return <UploadCourseScreen app={app} />;
      case 'architecture':
        return <ArchitectureScreen app={app} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.screen}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Digital Notes Selling App</Text>
          <Text style={styles.heroTitle}>Premium course notes, secure payments, trusted downloads.</Text>
          <Text style={styles.heroCopy}>
            Complete mobile frontend plus Firebase-ready project scaffolding for course catalog, admin upload,
            purchases, and Razorpay verification.
          </Text>
        </View>

        <AppShell title={titles[app.route.name]} app={app}>
          {renderScreen()}
        </AppShell>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#081120',
  },
  screen: {
    flex: 1,
    backgroundColor: '#081120',
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#0d182b',
    borderBottomWidth: 1,
    borderBottomColor: '#17243b',
  },
  eyebrow: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTitle: {
    marginTop: 10,
    color: '#f8fafc',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  heroCopy: {
    marginTop: 10,
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
});
