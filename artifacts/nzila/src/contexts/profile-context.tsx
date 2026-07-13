import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

interface Profile {
  country: string | null;
  isAngolan: boolean | null;
  onboardingDone: boolean;
}

interface ProfileContextValue {
  profile: Profile | null;
  isLoading: boolean;
  updateProfile: (data: Partial<Profile>) => void;
}

const PROFILE_KEY = "nzila_profile";

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  isLoading: false,
  updateProfile: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setProfile(null);
      return;
    }
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(`${PROFILE_KEY}_${user.id}`);
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        setProfile({ country: null, isAngolan: null, onboardingDone: false });
      }
    } catch {
      setProfile({ country: null, isAngolan: null, onboardingDone: false });
    }
    setIsLoading(false);
  }, [isAuthenticated, user?.id]);

  const updateProfile = (data: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...(profile ?? { country: null, isAngolan: null, onboardingDone: false }), ...data };
    localStorage.setItem(`${PROFILE_KEY}_${user.id}`, JSON.stringify(updated));
    setProfile(updated);
  };

  return (
    <ProfileContext.Provider value={{ profile, isLoading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
