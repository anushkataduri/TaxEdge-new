import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { LandingScreen } from "../components/landing/LandingScreen";

export default function Index() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state: any) => state.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(main)/home" as any);
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null;
  }

  return <LandingScreen />;
}
