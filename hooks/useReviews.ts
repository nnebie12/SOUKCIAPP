import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Review } from '@/types/database';

interface UseReviewsOptions {
  shopId: string;
  autoLoad?: boolean;
}

interface UseReviewsReturn {
  reviews: Review[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  userReview: Review | null;
  submitReview: (rating: number, comment: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  replyToReview: (reviewId: string, reply: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useReviews({
  shopId,
  autoLoad = true,
}: UseReviewsOptions): UseReviewsReturn {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userReview = reviews.find((r) => r.user_id === user?.id) ?? null;

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('reviews')
        .select(
          `
          *,
          user_profile:user_profiles(id, full_name, avatar_url)
        `
        )
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setReviews((data as Review[]) ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    if (autoLoad) fetchReviews();
  }, [fetchReviews, autoLoad]);

  // ── Submit review ────────────────────────────────────────────────────────
  const submitReview = useCallback(
    async (rating: number, comment: string) => {
      if (!user) throw new Error('Vous devez être connecté pour laisser un avis');
      if (rating < 1 || rating > 5) throw new Error('Note invalide');

      try {
        setSubmitting(true);
        setError(null);

        if (userReview) {
          // Mettre à jour l'avis existant
          const { error: err } = await supabase
            .from('reviews')
            .update({ rating, comment })
            .eq('id', userReview.id);
          if (err) throw err;
        } else {
          // Créer un nouvel avis
          const { error: err } = await supabase.from('reviews').insert({
            shop_id: shopId,
            user_id: user.id,
            rating,
            comment,
          });
          if (err) throw err;
        }

        await fetchReviews();
      } catch (e: any) {
        setError(e.message ?? "Erreur lors de l'envoi de l'avis");
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [user, shopId, userReview, fetchReviews]
  );

  // ── Delete review ────────────────────────────────────────────────────────
  const deleteReview = useCallback(
    async (reviewId: string) => {
      try {
        setSubmitting(true);
        const { error: err } = await supabase
          .from('reviews')
          .delete()
          .eq('id', reviewId);
        if (err) throw err;
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } catch (e: any) {
        setError(e.message ?? "Erreur lors de la suppression");
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  // ── Merchant reply ───────────────────────────────────────────────────────
  const replyToReview = useCallback(
    async (reviewId: string, reply: string) => {
      try {
        setSubmitting(true);
        const { error: err } = await supabase
          .from('reviews')
          .update({
            merchant_reply: reply,
            merchant_reply_at: new Date().toISOString(),
          })
          .eq('id', reviewId);
        if (err) throw err;
        await fetchReviews();
      } catch (e: any) {
        setError(e.message ?? 'Erreur lors de la réponse');
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchReviews]
  );

  return {
    reviews,
    loading,
    submitting,
    error,
    userReview,
    submitReview,
    deleteReview,
    replyToReview,
    refresh: fetchReviews,
  };
}
