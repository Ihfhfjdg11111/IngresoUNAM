import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AdminDataContext = createContext(null);

export const AdminDataProvider = ({ children }) => {
  const [cache, setCache] = useState({
    stats: null,
    users: null,
    simulators: null,
    questions: null,
    reports: null,
    lastFetched: {}
  });

  const isStale = useCallback((key, maxAge = 60000) => {
    const lastFetch = cache.lastFetched[key];
    if (!lastFetch) return true;
    return Date.now() - lastFetch > maxAge;
  }, [cache.lastFetched]);

  const getCachedData = useCallback((key) => {
    return cache[key];
  }, [cache]);

  const setCachedData = useCallback((key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: data,
      lastFetched: {
        ...prev.lastFetched,
        [key]: Date.now()
      }
    }));
  }, []);

  const invalidateCache = useCallback((key) => {
    if (key) {
      setCache(prev => ({
        ...prev,
        [key]: null,
        lastFetched: {
          ...prev.lastFetched,
          [key]: null
        }
      }));
    } else {
      setCache({
        stats: null,
        users: null,
        simulators: null,
        questions: null,
        reports: null,
        lastFetched: {}
      });
    }
  }, []);

  const value = useMemo(() => ({
    cache,
    isStale,
    getCachedData,
    setCachedData,
    invalidateCache
  }), [cache, isStale, getCachedData, setCachedData, invalidateCache]);

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
};

export default AdminDataContext;
