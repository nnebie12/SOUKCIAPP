import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { act, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

const mockMaybeSingle = jest.fn();
const mockInsertProfile = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockInvoke = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
    from: (table: string) => {
      if (table === 'user_profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockMaybeSingle,
            }),
          }),
          insert: mockInsertProfile,
        };
      }

      return {
        select: () => ({
          eq: () => ({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      };
    },
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}));

type CapturedAuth = ReturnType<typeof useAuth> | null;
let capturedAuth: CapturedAuth = null;

function Probe() {
  capturedAuth = useAuth();
  return <Text>auth-probe</Text>;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    capturedAuth = null;
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockInsertProfile.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
  });

  it('creates the related profile on sign up', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(capturedAuth?.loading).toBe(false));

    await act(async () => {
      await capturedAuth?.signUp(
        'merchant@soukci.app',
        'secret123',
        'SoukCI Test',
        '0700000000',
        { is_merchant: true, business_type: 'company' }
      );
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'merchant@soukci.app',
      password: 'secret123',
    });
    expect(mockInsertProfile).toHaveBeenCalledWith({
      id: 'user-123',
      full_name: 'SoukCI Test',
      phone: '0700000000',
      is_merchant: true,
      business_type: 'company',
    });
  });

  it('deletes the account through the edge function then signs out', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(capturedAuth?.loading).toBe(false));

    await act(async () => {
      await capturedAuth?.deleteAccount();
    });

    expect(mockInvoke).toHaveBeenCalledWith('delete-account', {
      body: { source: 'mobile-app' },
    });
    expect(mockSignOut).toHaveBeenCalled();
  });
});