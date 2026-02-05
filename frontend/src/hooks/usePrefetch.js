import { useCallback } from 'react';
import { API } from '../App';

const prefetchCache = new Map();

export const usePrefetch = () => {
  const prefetch = useCallback((endpoint, key) => {
    // Evitar prefetch duplicado
    if (prefetchCache.has(key)) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    prefetchCache.set(key, true);
    
    // Limpiar cache después de 30 segundos para permitir nuevo prefetch
    setTimeout(() => {
      prefetchCache.delete(key);
    }, 30000);

    // Prefetch silencioso
    fetch(`${API}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    }).catch(() => {}); // Silenciar errores de prefetch
  }, []);

  const prefetchAdminData = useCallback((section) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const endpoints = {
      dashboard: '/admin/stats',
      users: '/admin/users',
      simulators: '/simulators',
      questions: '/questions?limit=100',
      reports: '/admin/reports'
    };

    if (endpoints[section]) {
      prefetch(endpoints[section], `prefetch-${section}`);
    }
  }, [prefetch]);

  return { prefetch, prefetchAdminData };
};

export default usePrefetch;
