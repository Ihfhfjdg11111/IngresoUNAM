import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminData } from '../contexts/AdminDataContext';

export const useCachedFetch = (endpoint, cacheKey, options = {}) => {
  const { maxAge = 60000, immediate = true } = options;
  const { getCachedData, setCachedData, isStale } = useAdminData();
  
  const [data, setData] = useState(() => getCachedData(cacheKey));
  const [loading, setLoading] = useState(!data && immediate);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async (force = false) => {
    // Si ya estamos fetching, no hacer nada
    if (fetchingRef.current) return;
    
    // Si tenemos datos en cache y no son stale, usarlos
    const cached = getCachedData(cacheKey);
    if (!force && cached && !isStale(cacheKey, maxAge)) {
      setData(cached);
      setLoading(false);
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error fetching data');
      }

      const result = await response.json();
      setCachedData(cacheKey, result);
      setData(result);
    } catch (err) {
      setError(err.message);
      // Si hay error, mantener datos en cache si existen
      const cached = getCachedData(cacheKey);
      if (cached) setData(cached);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [endpoint, cacheKey, maxAge, getCachedData, setCachedData, isStale]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  const invalidate = useCallback(() => {
    setCachedData(cacheKey, null);
    setData(null);
  }, [cacheKey, setCachedData]);

  return { data, loading, error, refetch, invalidate };
};

export default useCachedFetch;
