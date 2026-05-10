import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../lib/httpClient.js";

/**
 * Fetch async data with loading / error / manual reload.
 * @param {string} cacheKey - When this changes, data is refetched (e.g. tripId)
 * @param {() => Promise<any>} fetcher
 */
export function useAsyncData(cacheKey, fetcher) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
      return result;
    } catch (e) {
      setError(e);
      setData(null);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcherRef.current();
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  return {
    data,
    error,
    loading,
    errorMessage: error ? getErrorMessage(error) : "",
    reload,
  };
}
