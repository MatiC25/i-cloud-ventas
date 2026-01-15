import { triggerCacheRebuild } from "@/services/api-back";
import { CacheCategory, DASHBOARD_KEY } from "@/types";

// Definimos los tipos de datos que manejamos


export const invalidateCache = async (category: CacheCategory) => {

    // if (category === 'all' || category === 'ventas') {
    //     CACHE.ventas = null;
    //     CACHE.ultimasVentas = null;
    // }

    if (category === 'all' || category === DASHBOARD_KEY) {
        sessionStorage.removeItem('iconnect_stats_v1');
    }

    triggerCacheRebuild(category).catch(console.error);

};