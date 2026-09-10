import { useCallback, useEffect } from "react";
import { useRouter, usePathname } from "expo-router";
import { useAuthStore } from "../../modules/authentication/store/authStore";

export function useServiceAccessGuard() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const profileCompleted = useAuthStore((s) => s.profileCompleted);
  const openCompleteProfileModal = useAuthStore((s) => s.openCompleteProfileModal);

  const accessService = useCallback(
    (targetRoute: any): boolean => {
      // 1. Checks authentication
      if (!isLoggedIn) {
        router.push("/(auth)/login" as any);
        return false;
      }

      // 2. Checks profile completion
      if (!profileCompleted) {
        // 3. Shows the Complete Profile popup and remembers requested route
        openCompleteProfileModal(typeof targetRoute === "string" ? targetRoute : targetRoute?.pathname || "/service/gst");
        return false;
      }

      // 4. Authorized: navigate to requested service
      router.push(targetRoute as any);
      return true;
    },
    [isLoggedIn, profileCompleted, openCompleteProfileModal, router]
  );

  return {
    accessService,
    isLoggedIn,
    profileCompleted,
  };
}

/**
 * Hook for screen-level protection when a service route mounts directly
 */
export function useServiceProtection(targetRoute?: any) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const profileCompleted = useAuthStore((s) => s.profileCompleted);
  const openCompleteProfileModal = useAuthStore((s) => s.openCompleteProfileModal);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/(auth)/login" as any);
      return;
    }

    if (!profileCompleted) {
      const routeToSave = targetRoute || pathname;
      openCompleteProfileModal(routeToSave);
      router.back();
    }
  }, [isLoggedIn, profileCompleted, targetRoute, pathname, openCompleteProfileModal, router]);

  return {
    isAuthorized: isLoggedIn && profileCompleted,
  };
}

export default useServiceAccessGuard;
