import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRedirectParam } from "./useRedirectParam";
import { useAuth } from "../app/auth/AuthContext";

export function useRedirect() {
  const router = useRouter();
  const { user } = useAuth();
  const redirect = useRedirectParam();

  useEffect(() => {
    if (!user) {
      return;
    }
    window.location.href = redirect ?? "/";
  }, [user, router, redirect]);
}
