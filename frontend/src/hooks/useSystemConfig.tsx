"use client";

import useSWRImmutable from "swr/immutable";
import { useEffect, useState, useCallback } from "react";
import { getFullConfig } from "@/services/api-back";
import { CONFIG_KEY, IConfig, IFormConfig, IProductosConfig, IGastosConfig } from "@/types";

// --- TUS TIPOS (Sin cambios) ---
export interface SystemConfig {
  formConfig: IFormConfig;
  productosConfig: IProductosConfig[];
  gastosConfig: IGastosConfig;
}

// --- FETCH SYSTEM CONFIG CON LOGS ---
const fetchSystemConfig = async (): Promise<IConfig> => {
  console.log("🚀 [3] Iniciando petición a Google Apps Script...");
  
  try {
    const response = await getFullConfig();
    console.log("📦 [4] Respuesta recibida del servidor:", response);

    if (!response || !response.productosConfig || !response.formConfig || !response.gastosConfig) {
       console.error("❌ [ERROR] La respuesta parece incompleta:", response);
     throw new Error("La configuración recibida está incompleta o vacía.");
    }

    return response as IConfig;
  } catch (err) {
    console.error("💥 [5] Error fatal en el fetch:", err);
    throw err;
  }
};

// --- PROCESADOR (Sin cambios de lógica) ---
function processConfig(rawData: IConfig): SystemConfig {
  const { formConfig, productosConfig, gastosConfig } = rawData;


   const formRows = Array.isArray(formConfig) ? formConfig : [];
      const processedFormConfig: IFormConfig = {
          canalesDeVenta: Array.from(new Set(
            formRows.map(r => r["Canal de Venta"]).filter((v) => v && v !== "")
        )),
  
        estado: Array.from(new Set(
            formRows.map(r => r["Estado"]).filter((v) => v && v !== "")
        )),
      }


  return {
    formConfig: processedFormConfig,
    productosConfig: Array.isArray(productosConfig)
      ? productosConfig.map((p: any) => ({
        categoria: p["Categoria"] || "",
        modelo: p["Modelo"] || "",
        variantes: p["Variantes"] || "",
        colores: p["Colores"] || ""
      }))
      : [],
    gastosConfig
  };
}

// --- HOOK PRINCIPAL ---
export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // 1. HIDRATACIÓN
  useEffect(() => {
    console.log("💧 [1] Iniciando Hidratación...");
    try {
      const cached = localStorage.getItem(CONFIG_KEY);
      if (cached) {
        console.log("💾 [2] Encontré caché, procesando...");
        setConfig(processConfig(JSON.parse(cached)));
      } else {
        console.log("🤷‍♂️ [2] No hay caché local.");
      }
    } catch (e) {
      console.warn("⚠️ Error leyendo caché, limpiando...");
      localStorage.removeItem(CONFIG_KEY);
    } finally {
      console.log("✅ [2.5] Hidratación terminada. Hydrated = true");
      setHydrated(true);
    }
  }, []);

  // 2. SWR
  const { data, error, mutate, isValidating } = useSWRImmutable(
    hydrated ? CONFIG_KEY : null, // Solo dispara si hydrated es true
    fetchSystemConfig,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onSuccess: (data) => console.log("🎉 [6] SWR Éxito", data),
      onError: (err) => console.log("💀 [6] SWR Error", err),
    }
  );

  // 3. ACTUALIZACIÓN DE ESTADO
  useEffect(() => {
    if (!data) return;
    console.log("🔄 [7] Actualizando estado con nuevos datos...");
    const processed = processConfig(data);
    setConfig(processed);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(data));
  }, [data]);

  // LOG DE DEBUG DEL ESTADO ACTUAL
  console.log(`📊 [Estado UI] Config: ${!!config}, Error: ${!!error}, Loading calculado: ${!config && !error}`);

  const forceReload = useCallback(async () => {
     // ... (tu lógica de reload)
  }, [mutate]);

  return {
    config,
    // LÓGICA CORREGIDA:
    isLoading: !config && !error,
    isError: error ?? null,
    isValidating,
    forceReload,
  };
}