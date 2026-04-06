import { act, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

const mockUseAuth = jest.fn();
const mockSelectOrder = jest.fn();
const mockInsert = jest.fn();
const mockDeleteEq = jest.fn();
const mockDelete = jest.fn(() => ({ eq: mockDeleteEq }));
const mockUpdateEq = jest.fn();
const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
const mockChannelSubscribe = jest.fn();
const mockChannelOn = jest.fn(() => ({ subscribe: mockChannelSubscribe }));
const mockChannel = jest.fn(() => ({ on: mockChannelOn }));
const mockRemoveChannel = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'cart_items') {
        return {
          select: () => ({
            eq: () => ({
              order: mockSelectOrder,
            }),
          }),
          insert: mockInsert,
          delete: mockDelete,
          update: mockUpdate,
        };
      }

      return {
        select: () => ({
          eq: () => ({ order: mockSelectOrder }),
        }),
      };
    },
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  },
}));

const { CartProvider, useCart } = require('@/contexts/CartContext');

type CapturedCart = ReturnType<typeof useCart> | null;
let capturedCart: CapturedCart = null;

function Probe() {
  capturedCart = useCart();
  return <Text>cart-probe</Text>;
}

describe('CartProvider', () => {
  beforeEach(() => {
    capturedCart = null;
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
    mockSelectOrder.mockResolvedValue({ data: [], error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockDeleteEq.mockResolvedValue({ error: null });
    mockUpdateEq.mockResolvedValue({ error: null });
    mockChannelSubscribe.mockReturnValue({ unsubscribe: jest.fn() });
  });

  it('adds a product to the cart for the authenticated user', async () => {
    render(
      <CartProvider>
        <Probe />
      </CartProvider>
    );

    await waitFor(() => expect(capturedCart?.loading).toBe(false));

    await act(async () => {
      await capturedCart?.addToCart(
        {
          id: 'product-1',
          shop_id: 'shop-1',
          name: 'Attieke premium',
          description: null,
          price: 3500,
          photo_url: null,
          is_available: true,
          category: null,
          created_at: null,
          updated_at: null,
        } as any,
        2
      );
    });

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      product_id: 'product-1',
      shop_id: 'shop-1',
      quantity: 2,
    });
  });

  it('clears the current user cart', async () => {
    render(
      <CartProvider>
        <Probe />
      </CartProvider>
    );

    await waitFor(() => expect(capturedCart?.loading).toBe(false));

    await act(async () => {
      await capturedCart?.clearCart();
    });

    expect(mockDelete).toHaveBeenCalled();
    expect(mockDeleteEq).toHaveBeenCalledWith('user_id', 'user-1');
  });
});