import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/services/api-back';
import { IDashboardStatsResponse, DASHBOARD_KEY } from '@/types'; 
import useSWR from 'swr';


interface CacheEnvelope {
  data: IDashboardStatsResponse;
  timestamp: number;
}

export function useEstadisticasDashboardCache() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    DASHBOARD_KEY, 
    async () => {
      const res = await getDashboardStats();
      return res.data; 
    },
    {
      // CONFIGURACIÓN CLAVE PARA TU CASO:
      revalidateOnFocus: false,      // No recargar solo por cambiar de pestaña (ahorra cuota GAS)
      dedupingInterval: 60000,       // Si se pide 2 veces en 1 min, usa caché memoria
      keepPreviousData: true,        // CRUCIAL: Muestra datos viejos mientras carga los nuevos (Adios Skeleton)
      fallbackData: typeof window !== 'undefined' 
        ? JSON.parse(sessionStorage.getItem(DASHBOARD_KEY) || 'null') 
        : null // Opcional: Persistencia entre recargas de página
    }
  );

  // Efecto secundario para persistir en sessionStorage (opcional, SWR ya tiene caché en memoria)
  if (data && typeof window !== 'undefined') {
      sessionStorage.setItem(DASHBOARD_KEY, JSON.stringify(data));
  }

  return {
    stats: data,
    loading: isLoading, // Solo true la PRIMERA vez que entras a la app
    isRefreshing: isValidating, // True cuando está actualizando en background
    error,
    mutate // Exportamos mutate por si quieres recargar manualmente
  };
}

// export function useEstadisticasDashboardCache() {
//   // const [stats, setStats] = useState<IDashboardStatsResponse | null>(null);

//   const [stats, setStats] = useState<IDashboardStatsResponse | null>(() => {
//     const cachedRaw = typeof window !== 'undefined' ? sessionStorage.getItem(DASHBOARD_KEY) : null;
//     if (cachedRaw) {
//       const envelope: CacheEnvelope = JSON.parse(cachedRaw);
//       const isExpired = Date.now() - envelope.timestamp > CACHE_VALIDITY_MS;
//       // Si el dato existe, lo devolvemos (aunque esté vencido, para mostrar algo rápido)
//       return envelope.data;
//     }
//     return null;
//   });

//   const [loading, setLoading] = useState(!stats); 
//   const [error, setError] = useState<string | null>(null);

//   // Función para obtener datos (del caché o API)
//   const fetchStats = async (forceRefresh = false) => {
//     if (!stats || forceRefresh) setLoading(true);
//     setError(null);

//     try {
//       // 1. Revisar SessionStorage (si no forzamos refresco)
//       if (!forceRefresh) {
//         const cachedRaw = sessionStorage.getItem(DASHBOARD_KEY);
//         if (cachedRaw) {
//           const envelope: CacheEnvelope = JSON.parse(cachedRaw);
//           const now = Date.now();

//           // Si el dato es reciente (< 5 min), usarlo y no llamar a la API
//           if (now - envelope.timestamp < CACHE_VALIDITY_MS) {
//             setStats(envelope.data);
//             setLoading(false);
//             console.log("Frontend Cache Hit 🚀");
//             return;
//           }
//         }
//       }

//       // La respuesta de getDashboardStats es directamente el objeto IDashboardStatsResponse
//       // (ya fue 'unwrapped' por apiRequest en api-back/api-template)
//       const result = await getDashboardStats();
    
//       // console.log("DASHBOARD RAW RESULT:", result);
//       // console.log("Dashboard source:", result.source);

//       if (result?.data) {
//         setStats(result.data);

//         // 3. Guardar en SessionStorage
//         const envelope: CacheEnvelope = {
//           data: result.data,
//           timestamp: Date.now(),
//         };
//         sessionStorage.setItem(CACHE_KEY, JSON.stringify(envelope));
//       } else {
//         throw new Error('No se recibieron datos del servidor');
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Error desconocido');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cargar al montar el componente
//   useEffect(() => {
//     fetchStats();
//   }, []);

//   return {
//     stats,
//     loading,
//     error,
//     isRefreshing: loading && !!stats, 
//     reload: () => fetchStats(true)
//   };
// }