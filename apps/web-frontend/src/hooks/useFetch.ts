import { useState, useEffect, useCallback } from 'react';

export const useFetch = <T>(fetchFn: () => Promise<unknown>, deps: unknown[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchFn();
      const value =
        raw !== null && raw !== undefined && typeof raw === 'object' && 'data' in (raw as object)
          ? (raw as { data: T }).data
          : (raw as T | null);
      setData(value);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
};
