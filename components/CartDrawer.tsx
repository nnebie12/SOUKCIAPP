import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { CartItemWithProduct } from '@/types/database';

// ═══════════════════════════════════════════════════════════════════
// CartItem
// ═══════════════════════════════════════════════════════════════════

interface CartItemRowProps {
  item: CartItemWithProduct;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleDecrement = () => {
    if (item.quantity <= 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const subtotal = item.product.price * item.quantity;

  return (
    <View style={styles.itemRow}>
      {/* Vignette produit */}
      <View style={styles.itemThumb}>
        {item.product.photo_url ? (
          <Image
            source={{ uri: item.product.photo_url }}
            style={styles.thumbImage}
          />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <ShoppingBag size={20} color={Colors.text.light} />
          </View>
        )}
      </View>

      {/* Infos */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.itemShop} numberOfLines={1}>
          {item.shop?.name}
        </Text>
        <Text style={styles.itemPrice}>
          {subtotal.toLocaleString('fr-CI')} FCFA
        </Text>
      </View>

      {/* Contrôles quantité */}
      <View style={styles.qtyControls}>
        <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrement}>
          {item.quantity <= 1 ? (
            <Trash2 size={14} color={Colors.status.error} />
          ) : (
            <Minus size={14} color={Colors.text.primary} />
          )}
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}>
          <Plus size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CartDrawer — bottom sheet
// ═══════════════════════════════════════════════════════════════════

interface CartDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function CartDrawer({ visible, onClose }: CartDrawerProps) {
  const { items, itemCount, totalAmount, loading, clearCart } = useCart();

  const handleCheckout = () => {
    onClose();
    router.push('/cart');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.drawer} onPress={() => {}}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.drawerTitleRow}>
              <ShoppingBag size={20} color={Colors.primary} />
              <Text style={styles.drawerTitle}>
                Mon panier{itemCount > 0 ? ` (${itemCount})` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Contenu */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyBox}>
              <ShoppingBag size={48} color={Colors.border.medium} />
              <Text style={styles.emptyText}>Votre panier est vide</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => <CartItemRow item={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Footer */}
          {items.length > 0 && (
            <View style={styles.footer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {totalAmount.toLocaleString('fr-CI')} FCFA
                </Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleCheckout}>
                <Text style={styles.checkoutBtnText}>
                  Passer la commande
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
                <Text style={styles.clearBtnText}>Vider le panier</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // CartItem
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    gap: Spacing.sm,
  },
  itemThumb: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  itemShop: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  qtyValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text.primary,
    minWidth: 20,
    textAlign: 'center',
  },

  // CartDrawer
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '85%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  drawerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  drawerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  loadingBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSizes.md,
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  clearBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
});
