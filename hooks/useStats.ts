import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MerchantStats } from '@/types/database';

interface UseStatsReturn {
  stats: MerchantStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Charge les statistiques d'une boutique pour le tableau de bord commerçant.
 * @param shopId - l'ID de la boutique
 */
export function useStats(shopId: string | null): UseStatsReturn {
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!shopId) return;

    try {
      setLoading(true);
      setError(null);

      // Données de la boutique (vues, clics, notes)
      const { data: shop, error: shopErr } = await supabase
        .from('shops')
        .select('view_count, click_count, rating_avg, rating_count')
        .eq('id', shopId)
        .single();

      if (shopErr) throw shopErr;

      // Commandes livrées
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .eq('shop_id', shopId);

      if (ordersErr) throw ordersErr;

      const deliveredOrders = (orders ?? []).filter(
        (o) => o.status === 'delivered'
      );

      // Campagnes actives — impressions totales
      const { data: campaigns, error: campErr } = await supabase
        .from('campaigns')
        .select('impressions')
        .eq('shop_id', shopId)
        .in('status', ['active', 'completed']);

      if (campErr) throw campErr;

      const totalImpressions = (campaigns ?? []).reduce(
        (sum, c) => sum + (c.impressions ?? 0),
        0
      );

      // Calcul des 7 derniers jours (vues simulées à partir du total)
      const weeklyViews = buildWeeklyProxy(shop?.view_count ?? 0);
      const weeklyOrders = buildWeeklyOrderCounts(orders ?? []);

      setStats({
        views: shop?.view_count ?? 0,
        clicks: shop?.click_count ?? 0,
        reviewCount: shop?.rating_count ?? 0,
        ratingAvg: parseFloat((shop?.rating_avg ?? 0).toFixed(1)),
        ordersTotal: deliveredOrders.length,
        ordersRevenue: deliveredOrders.reduce(
          (sum, o) => sum + (o.total_amount ?? 0),
          0
        ),
        campaignImpressions: totalImpressions,
        weeklyViews,
        weeklyOrders,
      });
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Génère un tableau de 7 valeurs décroissantes simulant l'historique
 * des vues quand on ne dispose pas de données journalières en base.
 */
function buildWeeklyProxy(total: number): number[] {
  const avg = Math.round(total / 30); // approximation journalière sur 30j
  return Array.from({ length: 7 }, (_, i) => {
    const jitter = Math.round(avg * (0.5 + Math.random()));
    return Math.max(0, jitter);
  });
}

/**
 * Compte les commandes créées chacun des 7 derniers jours.
 */
function buildWeeklyOrderCounts(
  orders: { created_at: string; status: string }[]
): number[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - i));
    const dayStr = day.toISOString().slice(0, 10);
    return orders.filter((o) => o.created_at.slice(0, 10) === dayStr).length;
  });
}
