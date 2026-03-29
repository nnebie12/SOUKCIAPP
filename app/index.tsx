import { useEffect } from "react";
import { router } from "expo-router";
import { hasSeenOnboarding } from "./onboarding";

export default function Index() {
  useEffect(() => {
    const redirect = async () => {
      const seen = await hasSeenOnboarding();

      if (!seen) {
        router.replace("/onboarding");
      } else {
        router.replace("/(tabs)");
      }
    };

    redirect();
  }, []);

  return null;
}