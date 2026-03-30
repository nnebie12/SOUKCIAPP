/**
 * useCart — Thin re-export of CartContext hook.
 *
 * Usage :
 *   const { items, addToCart, totalAmount } = useCart();
 *
 * Le CartProvider doit entourer l'application dans _layout.tsx.
 */
export { useCart } from '@/contexts/CartContext';
