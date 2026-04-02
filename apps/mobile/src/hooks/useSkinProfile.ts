import { useEffect, useState, useCallback } from 'react';
import { SkinProfile } from '../services/api';
import { getLocalProfile, syncProfile, pullProfile } from '../stores/profile';

export function useSkinProfile() {
  const [profile, setProfile] = useState<SkinProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const local = await getLocalProfile();
    if (local) {
      setProfile(local);
      setLoading(false);
      // Background sync
      pullProfile().then((synced) => {
        if (synced) setProfile(synced);
      });
    } else {
      const remote = await pullProfile();
      setProfile(remote);
      setLoading(false);
    }
  };

  const saveProfile = useCallback(
    async (data: {
      skin_type: string;
      concerns: number[];
      sensitivities: {
        fragrance: boolean;
        alcohol: boolean;
        paraben: boolean;
        essential_oils: boolean;
      };
      age_range?: string;
    }) => {
      const saved = await syncProfile(data);
      setProfile(saved);
      return saved;
    },
    [],
  );

  return { profile, loading, saveProfile, refresh: loadProfile };
}
