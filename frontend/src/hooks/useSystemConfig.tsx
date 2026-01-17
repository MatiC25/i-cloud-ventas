"use client";

import useSWRImmutable from "swr/immutable";
import { useEffect, useState, useCallback } from "react";
import { getFormOptions, getGastosConfig, getProductosConfig } from "@/services/api-back";
import { CONFIG_KEY } from "@/types";

/**
 * Tipos (ajustalos si querés ser más estricto)
 */
type RawSystemConfig = {
  formOptions: any;
  gastosConfig: any[];
  productosConfig: any[];
};

type SystemConfig = {
  formConfig: any;
  productosConfig: any[];
  rawGastos: any[];
};

/**
 * Fetcher único del sistema
 */
const fetchSystemConfig = async (): Promise<RawSystemConfig> => {
  const [formOptions, gastosConfig, productosConfig] = await Promise.all([
    getFormOptions(),
    getGastosConfig(),
    getProductosConfig(),
  ]);

  return { formOptions, gastosConfig, productosConfig };
};

/**
 * Normalizador / procesador de config
 * FUNCIÓN PURA
 */
function processConfig(data: RawSystemConfig): SystemConfig {
  const { formOptions, gastosConfig, productosConfig } = data;

  let destinos: string[] = [];
  if (Array.isArray(gastosConfig)) {
    destinos = Array.from(
      new Set(
        gastosConfig
          .map((r: any) => r?.Destinos)
          .filter(Boolean)
      )
    );
  }

  return {
    formConfig: {
      ...formOptions,
      destinos,
    },
    productosConfig: Array.isArray(productosConfig) ? productosConfig : [],
    rawGastos: Array.isArray(gastosConfig) ? gastosConfig : [],
  };
}

/**
 * HOOK PRINCIPAL
 */
export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [hydrated, setHydrated] = useState(false);

  /**
   * 1️⃣ Hidratar desde localStorage (sin SWR)
   */
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CONFIG_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as RawSystemConfig;
        setConfig(processConfig(parsed));
      }
    } catch (e) {
      console.warn("⚠️ Error leyendo cache local");
    } finally {
      setHydrated(true);
    }
  }, []);

  /**
   * 2️⃣ Fetch remoto (una sola vez)
   * Solo se ejecuta cuando terminó la hidratación
   */
  const { data, error, mutate, isValidating } = useSWRImmutable(
    hydrated ? CONFIG_KEY : null,
    fetchSystemConfig,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  /**
   * 3️⃣ Cuando llega data nueva → persistir y actualizar estado
   */
  useEffect(() => {
    if (!data) return;

    const processed = processConfig(data);
    setConfig(processed);

    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(data));
    } catch {
      console.warn("⚠️ No se pudo guardar cache en localStorage");
    }
  }, [data]);

  const forceReload = useCallback(async () => {
    try {
      // A. Limpieza visual inmediata (Opcional: si quieres que aparezca el spinner)
      // setConfig(null); 
      setConfig(null);
      
      // B. Borrar persistencia
      localStorage.removeItem(CONFIG_KEY);
      
      // C. Decirle a SWR que los datos actuales son inválidos y refetchear
      // El 'true' al final fuerza la revalidación
      await Promise.all([
          mutate(undefined, { revalidate: true }), // El 'undefined' borra la cache de memoria de SWR
          new Promise(resolve => setTimeout(resolve, 800))
      ]);
      
    } catch (e) {
      console.error("Error al recargar configuración", e);
    }
  }, [mutate]);

  return {
    config,                              // null | SystemConfig
    isLoading: !config && !error,        // loader real, sin loops
    isError: error ?? null,
    isValidating,
    forceReload,          // refresh manual
  };
}
