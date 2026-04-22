import { PREMIUM_ENTITLEMENT_ID, PREMIUM_OFFERING_ID } from '@/constants/billing';
import { useAuth } from '@/contexts/AuthContext';
import { configureRevenueCat, Purchases } from '@/lib/revenuecat';
import { supabase } from '@/lib/supabase';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

interface BillingPackageView {
  identifier: string;
  title: string;
  description: string;
  priceString: string;
  packageRef: any;
}

interface BillingContextValue {
  ready: boolean;
  enabled: boolean;
  hasPremiumEntitlement: boolean;
  premiumPackages: BillingPackageView[];
  refreshCustomerInfo: () => Promise<void>;
  purchasePremiumPackage: (pkg: BillingPackageView, shopId?: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [hasPremiumEntitlement, setHasPremiumEntitlement] = useState(false);
  const [premiumPackages, setPremiumPackages] = useState<BillingPackageView[]>([]);

  const refreshCustomerInfoInternal = useCallback(async () => {
    if (Platform.OS === 'web') {
      setHasPremiumEntitlement(false);
      return;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    setHasPremiumEntitlement(Boolean(premiumEntitlement?.isActive));
  }, []);

  const loadPremiumPackages = useCallback(async () => {
    if (Platform.OS === 'web') {
      setPremiumPackages([]);
      return;
    }

    const offerings = await Purchases.getOfferings();
    const offering = offerings.all[PREMIUM_OFFERING_ID] ?? offerings.current;
    const packages = offering?.availablePackages ?? [];

    setPremiumPackages(
      packages.map((pkg: any) => ({
        identifier: pkg.identifier,
        title: pkg.product.title,
        description: pkg.product.description,
        priceString: pkg.product.priceString,
        packageRef: pkg,
      }))
    );
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const isEnabled = await configureRevenueCat(user?.id ?? null);
        if (!active) return;
        setEnabled(isEnabled);

        if (!isEnabled) {
          setHasPremiumEntitlement(false);
          setPremiumPackages([]);
          return;
        }

        await refreshCustomerInfoInternal();
        await loadPremiumPackages();
      } finally {
        if (active) setReady(true);
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [user?.id, refreshCustomerInfoInternal, loadPremiumPackages]);

  const refreshCustomerInfo = useCallback(async () => {
    if (!enabled) return;
    await refreshCustomerInfoInternal();
  }, [enabled, refreshCustomerInfoInternal]);

  const purchasePremiumPackage = useCallback(async (pkg: BillingPackageView, shopId?: string) => {
    if (!enabled) {
      throw new Error('RevenueCat n est pas configure pour cet environnement.');
    }

    const result = await Purchases.purchasePackage(pkg.packageRef);
    const premiumEntitlement = result.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];

    if (!premiumEntitlement?.isActive) {
      throw new Error('Aucun droit Premium actif n a ete detecte apres l achat.');
    }

    setHasPremiumEntitlement(true);

    if (shopId) {
      const { error } = await supabase.functions.invoke('sync-merchant-premium', {
        body: { shopId },
      });

      if (error) throw error;
    }
  }, [enabled]);

  const restorePurchases = useCallback(async () => {
    if (!enabled) {
      throw new Error('RevenueCat n est pas configure pour cet environnement.');
    }

    await Purchases.restorePurchases();
    await refreshCustomerInfoInternal();
  }, [enabled, refreshCustomerInfoInternal]);

  const value = useMemo<BillingContextValue>(() => ({
    ready,
    enabled,
    hasPremiumEntitlement,
    premiumPackages,
    refreshCustomerInfo,
    purchasePremiumPackage,
    restorePurchases,
  }), [ready, enabled, hasPremiumEntitlement, premiumPackages, refreshCustomerInfo, purchasePremiumPackage, restorePurchases]);

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling() {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within BillingProvider');
  }
  return context;
}
