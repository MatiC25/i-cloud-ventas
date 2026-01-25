import useSWR from 'swr';
import { getVentasCharts } from "@/services/api-back";
import { IChartsData } from "@/types";

// Key única para identificar estos datos en la caché global
export const CHARTS_CACHE_KEY = 'sales-charts-data';

export function useSalesChartsCache(shouldFetch: boolean) {
    const { data, error, isLoading, mutate } = useSWR(
        shouldFetch ? CHARTS_CACHE_KEY : null, 
        async () => {
             const response = await getVentasCharts();
             const resAny = response as any;
             const dataReal = resAny.data?.data || resAny.data || resAny;
             if (!dataReal) throw new Error("No data received");
             return dataReal;
        },
        {
            revalidateOnFocus: false, 
            dedupingInterval: 60000 * 10, 
            keepPreviousData: true, 
            fallbackData: null
        }
    );

    return {
        chartsData: data as IChartsData | null,
        loadingCharts: isLoading,
        errorCharts: error,
        mutateCharts: mutate
    };
}