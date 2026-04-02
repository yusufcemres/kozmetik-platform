import { useEffect, useState } from 'react';
import { getPersonalScore, PersonalScore } from '../services/api';
import { getAnonymousId, getLocalProfile } from '../stores/profile';

export function usePersonalScore(productId: number | null) {
  const [score, setScore] = useState<PersonalScore | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const profile = await getLocalProfile();
        if (!profile) {
          setScore(null);
          return;
        }
        const anonymousId = await getAnonymousId();
        const res = await getPersonalScore(productId, anonymousId);
        if (!cancelled) setScore(res.data);
      } catch {
        if (!cancelled) setScore(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { score, loading };
}
