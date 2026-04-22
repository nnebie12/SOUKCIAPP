import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '@/constants/theme';
import { Review } from '@/types/database';
import { ChevronDown, ChevronUp, MessageSquare, Star, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ═══════════════════════════════════════════════════════════════════
// ReviewCard
// ═══════════════════════════════════════════════════════════════════

interface ReviewCardProps {
  review: Review;
  onReply?: (reviewId: string) => void;
  isMerchantView?: boolean;
}

export function ReviewCard({
  review,
  onReply,
  isMerchantView = false,
}: ReviewCardProps) {
  const [showReply, setShowReply] = useState(false);
  const avatarInitial =
    review.user_profile?.full_name?.charAt(0)?.toUpperCase() ?? '?';

  const formattedDate = new Date(review.created_at).toLocaleDateString('fr-CI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      {/* En-tête */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{avatarInitial}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.userName}>
            {review.user_profile?.full_name ?? 'Utilisateur'}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <StarRow rating={review.rating} />
      </View>

      {/* Commentaire */}
      {review.comment ? (
        <Text style={styles.comment}>{review.comment}</Text>
      ) : null}

      {/* Réponse du commerçant */}
      {review.merchant_reply ? (
        <TouchableOpacity
          style={styles.replyToggle}
          onPress={() => setShowReply((v) => !v)}>
          <MessageSquare size={14} color={Colors.primary} />
          <Text style={styles.replyToggleText}>Réponse du commerçant</Text>
          {showReply ? (
            <ChevronUp size={14} color={Colors.primary} />
          ) : (
            <ChevronDown size={14} color={Colors.primary} />
          )}
        </TouchableOpacity>
      ) : null}

      {showReply && review.merchant_reply ? (
        <View style={styles.replyBox}>
          <Text style={styles.replyText}>{review.merchant_reply}</Text>
        </View>
      ) : null}

      {/* Bouton répondre (vue commerçant) */}
      {isMerchantView && !review.merchant_reply && onReply ? (
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => onReply(review.id)}>
          <MessageSquare size={14} color={Colors.primary} />
          <Text style={styles.replyButtonText}>Répondre</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─── StarRow helper ───────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          color={s <= rating ? Colors.status.warning : Colors.border.light}
          fill={s <= rating ? Colors.status.warning : 'transparent'}
        />
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ReviewModal — pour écrire / modifier un avis
// ═══════════════════════════════════════════════════════════════════

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  initialRating?: number;
  initialComment?: string;
  shopName?: string;
}

export function ReviewModal({
  visible,
  onClose,
  onSubmit,
  initialRating = 0,
  initialComment = '',
  shopName,
}: ReviewModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Veuillez sélectionner une note');
      return;
    }
    try {
      setError('');
      setSubmitting(true);
      await onSubmit(rating, comment);
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {initialRating ? 'Modifier votre avis' : 'Écrire un avis'}
            </Text>
            {shopName ? (
              <Text style={styles.modalSubtitle}>{shopName}</Text>
            ) : null}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={22} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Étoiles interactives */}
          <Text style={styles.label}>Votre note</Text>
          <View style={styles.starPicker}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Star
                  size={36}
                  color={s <= rating ? Colors.status.warning : Colors.border.medium}
                  fill={s <= rating ? Colors.status.warning : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Commentaire */}
          <Text style={styles.label}>Commentaire (optionnel)</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Partagez votre expérience..."
            placeholderTextColor={Colors.text.light}
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>
                {initialRating ? 'Mettre à jour' : 'Envoyer'}
              </Text>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // ReviewCard
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.md,
  },
  cardMeta: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  date: {
    fontSize: FontSizes.xs,
    color: Colors.text.light,
    marginTop: 2,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  comment: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  replyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  replyToggleText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  replyBox: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  replyText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  replyButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },

  // ReviewModal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    paddingRight: 36,
  },
  modalSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  starPicker: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  textarea: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.md,
  },
});
