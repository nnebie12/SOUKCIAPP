import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Heart, Share2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Share,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

// ═══════════════════════════════════════════════════════════════════
// FavoriteBtn
// ═══════════════════════════════════════════════════════════════════

interface FavoriteBtnProps {
  shopId: string;
  initialFavorited?: boolean;
  size?: number;
  onToggle?: (favorited: boolean) => void;
  style?: object;
}

export function FavoriteBtn({
  shopId,
  initialFavorited = false,
  size = 22,
  onToggle,
  style,
}: FavoriteBtnProps) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour sauvegarder vos favoris.');
      return;
    }

    try {
      setLoading(true);
      if (favorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('shop_id', shopId);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, shop_id: shopId });
      }
      const next = !favorited;
      setFavorited(next);
      onToggle?.(next);
    } catch (err) {
      console.error('[FavoriteBtn]', err);
    } finally {
      setLoading(false);
    }
  }, [user, shopId, favorited, onToggle]);

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={toggle}
      disabled={loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator size="small" color={Colors.status.error} />
      ) : (
        <Heart
          size={size}
          color={favorited ? Colors.status.error : Colors.text.secondary}
          fill={favorited ? Colors.status.error : 'transparent'}
        />
      )}
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ShareButton
// ═══════════════════════════════════════════════════════════════════

interface ShareButtonProps {
  shopName: string;
  shopId: string;
  size?: number;
  style?: object;
}

export function ShareButton({
  shopName,
  shopId,
  size = 22,
  style,
}: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      setSharing(true);
      await Share.share({
        title: shopName,
        message: `Découvre ${shopName} sur SoukCI ! 🛍️\nhttps://soukci.app/shop/${shopId}`,
      });
    } catch (err: any) {
      if (err?.message !== 'User did not share') {
        console.error('[ShareButton]', err);
      }
    } finally {
      setSharing(false);
    }
  }, [shopName, shopId]);

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={handleShare}
      disabled={sharing}
      activeOpacity={0.7}>
      {sharing ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <Share2 size={size} color={Colors.text.secondary} />
      )}
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
});
