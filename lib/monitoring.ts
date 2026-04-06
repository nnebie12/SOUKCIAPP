import * as Sentry from '@sentry/react-native';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

if (sentryDsn && !Sentry.getClient()) {
  Sentry.init({
    dsn: sentryDsn,
    enabled: !__DEV__,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
  });
}

export { Sentry };
