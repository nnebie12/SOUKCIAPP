import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { getRevenueCatApiKey } from '@/constants/billing';

let configured = false;

export async function configureRevenueCat(appUserId?: string | null) {
  if (Platform.OS === 'web') {
    return false;
  }

  const apiKey = getRevenueCatApiKey(Platform.OS === 'android' ? 'android' : 'ios');
  if (!apiKey) {
    return false;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);

  if (!configured) {
    Purchases.configure({ apiKey, appUserID: appUserId ?? undefined });
    configured = true;
    return true;
  }

  if (appUserId) {
    await Purchases.logIn(appUserId);
  } else {
    await Purchases.logOut();
  }

  return true;
}

export { Purchases };
