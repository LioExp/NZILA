import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@workspace/replit-auth-web";

interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
  country: string | null;
  isAngolan: boolean | null;
  onboardingDone: boolean;
  level: string;
}

interface ProfileContextValue {
  profile: Profile | null;
  isLoading: boolean;
  refetch: () => void;
  updateProfile: (data: Partial<Pick<Profile, "country" | "isAngolan" | "onboardingDone">>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  isLoading: false,
  refetch: () => {},
  updateProfile: async () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const refetch = () => setTick((t) => t + 1);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }
    setIsLoading(true);
    fetch("/api/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [isAuthenticated, tick]);

  const updateProfile = async (data: Partial<Pick<Profile, "country" | "isAngolan" | "onboardingDone">>) => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setProfile(updated);
  };

  return (
    <ProfileContext.Provider value={{ profile, isLoading, refetch, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
