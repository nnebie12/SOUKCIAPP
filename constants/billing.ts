export const PREMIUM_ENTITLEMENT_ID = 'merchant_premium';
export const PREMIUM_OFFERING_ID = 'merchant_premium';

export const REVENUECAT_ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '';
export const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '';

export const CINETPAY_COUNTRY_CODE = 'CI';
export const CINETPAY_CURRENCY = 'XOF';

export function getRevenueCatApiKey(platform: 'android' | 'ios' | 'web'): string {
  if (platform === 'android') return REVENUECAT_ANDROID_API_KEY;
  if (platform === 'ios') return REVENUECAT_IOS_API_KEY;
  return '';
}

export function isCinetPayMethod(method: string): boolean {
  return method === 'wave' || method === 'orange_money' || method === 'mtn_money';
}

export function normalizeAmountForCinetPay(amount: number): number {
  return Math.round(amount);
}

export function isValidCinetPayAmount(amount: number): boolean {
  return amount > 0 && amount % 5 === 0;
}
