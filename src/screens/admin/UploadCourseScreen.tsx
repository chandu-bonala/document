import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { NotesAppController } from '../../hooks/useNotesApp';
import { colors, radii } from '../../theme';

export const UploadCourseScreen = ({ app }: { app: NotesAppController }) => (
  <ScrollView contentContainerStyle={styles.screen}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Upload Course</Text>
      <Text style={styles.sectionCopy}>
        Select the PDF, enter metadata, then save the course to Storage plus Firestore.
      </Text>
    </View>

    <View style={styles.card}>
      {app.uploadFeedback.message ? (
        <View
          style={[
            styles.feedbackCard,
            app.uploadFeedback.stage === 'error'
              ? styles.feedbackError
              : app.uploadFeedback.stage === 'done'
                ? styles.feedbackSuccess
                : styles.feedbackInfo,
          ]}
        >
          <Text style={styles.feedbackTitle}>
            {app.uploadFeedback.stage === 'error'
              ? 'Upload error'
              : app.uploadFeedback.stage === 'done'
                ? 'Upload complete'
                : 'Upload status'}
          </Text>
          <Text style={styles.feedbackText}>{app.uploadFeedback.message}</Text>
        </View>
      ) : null}
      <TextInput
        value={app.uploadForm.title}
        onChangeText={(title) => app.setUploadForm((current) => ({ ...current, title }))}
        style={styles.input}
        placeholder="Course title"
        placeholderTextColor="#7a8798"
      />
      <TextInput
        value={app.uploadForm.tagline}
        onChangeText={(tagline) => app.setUploadForm((current) => ({ ...current, tagline }))}
        style={styles.input}
        placeholder="Short tagline"
        placeholderTextColor="#7a8798"
      />
      <TextInput
        value={app.uploadForm.subject}
        onChangeText={(subject) => app.setUploadForm((current) => ({ ...current, subject }))}
        style={styles.input}
        placeholder="Subject"
        placeholderTextColor="#7a8798"
      />
      <TextInput
        value={app.uploadForm.level}
        onChangeText={(level) => app.setUploadForm((current) => ({ ...current, level }))}
        style={styles.input}
        placeholder="Level"
        placeholderTextColor="#7a8798"
      />
      <TextInput
        value={app.uploadForm.pageCount}
        onChangeText={(pageCount) => app.setUploadForm((current) => ({ ...current, pageCount }))}
        style={styles.input}
        placeholder="Page count"
        placeholderTextColor="#7a8798"
        keyboardType="numeric"
      />
      <TextInput
        value={app.uploadForm.price}
        onChangeText={(price) => app.setUploadForm((current) => ({ ...current, price }))}
        style={styles.input}
        placeholder="Price in INR"
        placeholderTextColor="#7a8798"
        keyboardType="numeric"
      />
      <TextInput
        value={app.uploadForm.description}
        onChangeText={(description) => app.setUploadForm((current) => ({ ...current, description }))}
        style={[styles.input, styles.textArea]}
        placeholder="Course description"
        placeholderTextColor="#7a8798"
        multiline
      />
      <Pressable onPress={app.pickPdf} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          {app.uploadForm.selectedPdfName ? `Selected: ${app.uploadForm.selectedPdfName}` : 'Choose PDF'}
        </Text>
      </Pressable>
      <Pressable
        onPress={app.submitCourseUpload}
        disabled={app.isUploading}
        style={[styles.primaryButton, app.isUploading && styles.buttonDisabled]}
      >
        <Text style={styles.primaryButtonText}>
          {app.isUploading ? 'Uploading course...' : 'Save Course'}
        </Text>
      </Pressable>
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
  feedbackCard: {
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 6,
  },
  feedbackInfo: {
    backgroundColor: '#12233a',
    borderColor: '#294166',
  },
  feedbackSuccess: {
    backgroundColor: '#0f2b24',
    borderColor: '#1f7a63',
  },
  feedbackError: {
    backgroundColor: '#341717',
    borderColor: '#a63d3d',
  },
  feedbackTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  feedbackText: {
    color: '#d7e3f4',
    fontSize: 13,
    lineHeight: 19,
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
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
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
  buttonDisabled: {
    opacity: 0.7,
  },
});
