// frontend/components/ui/AvisModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { avisService } from '../../services/avisService';
import { Toast } from './Toast';

interface AvisModalProps {
  visible: boolean;
  onClose: () => void;
  voyageId: number;
  trajetInfo?: string;
  onSuccess?: () => void;
}

export default function AvisModal({
  visible,
  onClose,
  voyageId,
  trajetInfo,
  onSuccess,
}: AvisModalProps) {
  const { theme } = useTheme(); // 👈 Hook dynamique
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  
  const [toastConfig, setToastConfig] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToastConfig({ message, type });
    setTimeout(() => setToastConfig(null), 3500);
  };

  const handleSubmit = async () => {
    if (note === 0) {
      showToast('Veuillez sélectionner une note', 'error');
      return;
    }

    setLoading(true);
    try {
      await avisService.createAvis(voyageId, note, commentaire);
      
      showToast('Merci pour votre avis ! 🎉', 'success');
      
      setTimeout(() => {
        setNote(0);
        setCommentaire('');
        onSuccess?.();
        onClose();
      }, 1500);
      
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNote(0);
    setCommentaire('');
    setToastConfig(null);
    onClose();
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoveredStar || note);
          return (
            <Pressable
              key={star}
              onPress={() => setNote(star)}
              onPressIn={() => setHoveredStar(star)}
              onPressOut={() => setHoveredStar(0)}
              style={styles.starButton}
            >
              <Ionicons
                name={isFilled ? 'star' : 'star-outline'}
                size={40}
                color={isFilled ? theme.colors.secondary[500] : theme.colors.neutral[300]}
              />
            </Pressable>
          );
        })}
      </View>
    );
  };

  // 👇 Styles déplacés dans le composant
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      backgroundColor: theme.colors.background.primary,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl,
      maxHeight: '90%',
      ...theme.shadows.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    trajetBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary[50],
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    trajetText: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.primary[700],
      fontWeight: theme.typography.weights.medium,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    label: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      marginVertical: theme.spacing.md,
    },
    starButton: {
      padding: theme.spacing.xs,
    },
    noteText: {
      textAlign: 'center',
      fontSize: theme.typography.sizes.body,
      color: theme.colors.secondary[600],
      fontWeight: theme.typography.weights.medium,
      marginTop: theme.spacing.sm,
    },
    textarea: {
      borderWidth: 1,
      borderColor: theme.colors.neutral[200],
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.typography.sizes.body,
      color: theme.colors.text.primary,
      minHeight: 120,
      backgroundColor: theme.colors.background.secondary,
    },
    charCount: {
      textAlign: 'right',
      fontSize: theme.typography.sizes.small,
      color: theme.colors.neutral[400],
      marginTop: theme.spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    button: {
      flex: 1,
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonCancel: {
      backgroundColor: theme.colors.background.secondary,
      borderWidth: 1,
      borderColor: theme.colors.neutral[300],
    },
    buttonCancelText: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.neutral[600],
    },
    buttonSubmit: {
      backgroundColor: theme.colors.primary[500],
      ...theme.shadows.sm,
    },
    buttonSubmitText: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.inverse,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.neutral[300],
      opacity: 0.6,
    },
  });

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <Pressable style={styles.backdrop} onPress={handleClose} />
          
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Donnez votre avis</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {trajetInfo && (
                <View style={styles.trajetBadge}>
                  <Ionicons name="bus" size={16} color={theme.colors.primary[500]} />
                  <Text style={styles.trajetText}>{trajetInfo}</Text>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.label}>Note *</Text>
                {renderStars()}
                {note > 0 && (
                  <Text style={styles.noteText}>
                    {note === 1 && '😞 Très mauvais'}
                    {note === 2 && '😕 Mauvais'}
                    {note === 3 && '😐 Moyen'}
                    {note === 4 && '😊 Bon'}
                    {note === 5 && '🤩 Excellent'}
                  </Text>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Votre commentaire (optionnel)</Text>
                <TextInput
                  style={styles.textarea}
                  placeholder="Partagez votre expérience..."
                  placeholderTextColor={theme.colors.neutral[400]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={commentaire}
                  onChangeText={setCommentaire}
                  maxLength={500}
                  editable={!loading}
                />
                <Text style={styles.charCount}>{commentaire.length}/500</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonCancel]}
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text style={styles.buttonCancelText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonSubmit,
                    (note === 0 || loading) && styles.buttonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={note === 0 || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonSubmitText}>Envoyer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {toastConfig && (
            <Toast
              message={toastConfig.message}
              type={toastConfig.type}
              onHide={() => setToastConfig(null)}
            />
          )}
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}