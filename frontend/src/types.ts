export interface IVenta {
    cliente: {
        nombre: string;
        apellido: string;
        email: string;
        canal: string;
        contacto: string;
    };
    productos: IProducto[];
    transaccion: ITransaccion;
    pagos: IPago[];
    parteDePago: {
        esParteDePago: boolean;
        tipo: string;
        modelo: string;
        capacidad: string;
        costo: number;
    };
    trazabilidad: {
        idOperacion: string;
        fecha: string;
        usuario: string;
    };
    usuario?: string;
}

export interface ICliente {
    nombre: string;
    apellido: string;
    email: string;
    canal: string;
    contacto: string;
}

export interface IProducto {
    tipo: string;
    modelo: string;
    capacidad: string;
    color: string;
    estado: string;
    imei?: string;
    precio: number;
    costo: number;
    cantidad: number;
}

export interface IPago {
    monto: number;
    divisa: string;
    tipoCambio: number;
}

export interface ITransaccion {
    envioRetiro: string;
    comentarios: string;
}

export interface IPartePago {
    esParteDePago: boolean;
    tipo: string;
    modelo: string;
    capacidad: string;
    costo: number;
}

// --- CONFIGURACIÓN DE PRODUCTOS --- //
// --- CONFIGURACIÓN DE PRODUCTOS --- //
export interface IConfigProducto {
    Categoria: string;
    Modelo: string;
    Variantes: string; // Comma separated? Or single value? We'll assume string for now based on backend
    Colores: string;
}

export interface IProductConfig {
    categoria: string;
    modelo: string;
    tamaños: string[];
    colores: string[];
    imeis?: string[];
    costo: number;
}

// -- VENTAS REALIZADAS -- 
export interface IVentaHistorial {
    id: string;
    fecha: string;
    cliente: string;
    producto: string;
    monto: number;
    divisa: string;
}

export interface IVentaTabla {
    id: string;
    fecha: Date;         // Ya lo convertimos a objeto Date real
    vendedor: string;    // Auditoría
    cliente: string;     // Nombre completo
    producto: string;    // Resumen: "iPhone 13 128GB"
    monto: number;       // Total en Dólares parseado
    estado: string;

    // Additional fields for editing/calc
    tipoCambio: number;
    conversion: number;
    profit: number;
    costo: number;
    cantidad: number;

    // Expand details
    email?: string;
    detallePago?: string;
}

export const adaptarVentaParaTabla = (row: any): IVentaTabla => {
    return {
        id: row["N° ID"] || Math.random().toString(), // Fallback por si acaso

        // Convertimos string de fecha a Objeto Date real
        fecha: new Date(row["Fecha"]),

        // Manejamos posibles nulos con "||"
        vendedor: row["Auditoría"] || "Sistema",
        cliente: row["Nombre y Apellido"] || "Desconocido",

        // Concatenamos para que la tabla solo muestre una columna "Producto" limpia
        producto: `${row["Equipo | Producto"] || ''} ${row["Modelo"] || ''} ${row["Tamaño"] || ''}`.trim(),

        // Aseguramos que sea número para poder ordenar/filtrar por monto
        monto: Number(row["Total en Dolares"]) || 0,

        // New Fields mapping
        tipoCambio: Number(row["Tipo de Cambio"]) || 0,
        conversion: Number(row["Conversión"]) || 0,
        profit: Number(row["Profit Bruto"]) || 0,
        costo: Number(row["Costo del Producto"]) || 0, // Ajustar nombre columna si difiere
        cantidad: Number(row["Cantidad"]) || 1,

        estado: row["Estado"] || "Finalizado"
    };
};

// -- CONFIGURACIÓN DE FORMULARIO -- 
export interface IFormConfig {
    metodosPago: string[];
    divisas: string[];
    tiposDeOperaciones: string[];
    tiposDeProductos: string[];
    modelosDeProductos: string[];
    capacidadesDeProductos: string[];
    coloresDeProductos: string[];
    canalesDeVenta: string[];
    estadosDeProductos: string[];
    destinos?: string[];
}

export interface ISaveVentaResponse {
    status: string;
    message: string;
    id_operacion: number;
}

// --- TABLA DE OPERACIONES (LIBRO DIARIO) ---
export interface IOperacion {
    id: string;
    fecha: Date;
    detalle: string;
    tipo: string;      // Ingreso / Egreso
    categoria: string; // Venta / Gasto / etc.
    monto: number;
    divisa: string;
    destino: string;
    comentarios: string;
    auditoria: string;
}

export interface IGastosConfigRow {
    "Destinos": string;
    "Divisas": string;
    "Tipos de Movimiento": string;
    "Categoría de Movimiento": string;
}

export const adaptarOperacionParaTabla = (row: any): IOperacion => {
    let fechaParsed = new Date(row["Fecha"]);
    // Si es inválida (ej: "Invalid Date"), usamos fecha actual o null (pero la interfz pide Date)
    if (isNaN(fechaParsed.getTime())) {
        fechaParsed = new Date(); // Fallback seguridad
    }

    let divisaRaw = row["Divisa"] || "USD";

    // Normalización de códigos de moneda
    const currencyMap: Record<string, string> = {
        "Dólares": "USD",
        "USDT": "USDT",
        "Pesos argentinos": "ARS",
        "Pesos uruguayos": "UYU",
        "Euros": "EUR",
        "Reales": "BRL",
        "Libras": "GBP"
    };

    if (currencyMap[divisaRaw]) {
        divisaRaw = currencyMap[divisaRaw];
    }

    return {
        id: row["ID"] || "", // ID may be empty for old operations
        fecha: fechaParsed,
        detalle: row["Detalle"] || "",
        tipo: row["Tipo de Movimiento"] || "",
        categoria: row["Categoría de Movimiento"] || "",
        monto: Number(row["Monto"]) || 0,
        divisa: divisaRaw,
        destino: row["Destino"] || "",
        comentarios: row["Comentarios"] || "",
        auditoria: row["Auditoría"] || "Sistema"
    };
};

export interface IActivityItem {
    id: string;
    fecha: string;
    cliente: string;
    monto: number;
    divisa: string;
    tipo: "Venta" | "Gasto";
}

export interface IDashboardStats {
    profitMensual: number;
    gastosMensuales: number;
    saldoARS: number;
    saldoUSD: number;
    chartData: Array<{ date: string, income: number, expense: number, profit: number }>;
    lastUpdate: string;
    metaAdsSpend: number;
    expensesPie: Array<{ name: string, value: number }>;
    categorias: Array<{ name: string, value: number }>; // Renamed from salesByCategory and changed structure
    topProductos: Array<{ name: string, sales: number, profit: number }>; // Renamed and changed

    // New fields
    billeterasDetalle: {
        ARS: Record<string, number>;
        USD: Record<string, number>;
    };
    recientes: IActivityItem[];

    // Legacy or unused but kept for compatibility if needed
    paymentMethods?: Array<{ name: string, value: number, percentage: string }>;

    totalOrdenes: number;
    tendenciaProfit: number; // We mapped ordersTrend to this in backend for now
}

export interface IBalanceResponse {
    saldoARS: number;
    saldoUSD: number;
    billeterasDetalle: {
        ARS: Record<string, number>;
        USD: Record<string, number>;
    };
}

// ==================== //
// --- Dashboard Stats ---
// ==================== //

export interface IDashboardCacheEnvelope {
  source: "cache" | "rebuild";
  data: IDashboardStatsResponse;
}

export interface IDashboardStatsResponse {
    // --- Sección: Finanzas en vivo (Cajas) ---
    saldoARS: number;
    saldoUSD: number;
    billeterasDetalle: {
        ARS: Record<string, number>; // Ej: { "Caja Chica": 15000, "Banco": 50000 }
        USD: Record<string, number>; // Ej: { "Payoneer": 200, "Efectivo": 100 }
    };

    // --- Sección: Métricas de Ventas ---
    stats: {
        hoy: MetricsBucket;
        mes: MetricsBucket;
        anio: MetricsBucket;
        historico: MetricsBucket;
    };

    topVendedores: VendedorStat[];

    ultimasOperaciones: OperacionReciente[];
    rankingProductos?: RankingProductos[];

    ultimaModificacion: string;
}

// Sub-tipos para mantener el código limpio

export interface MetricsBucket {
    total: number;
    count: number;
    profit: number;
}

export interface VendedorStat {
    name: string;
    total: number;
    count: number;
    profit: number;
}

export interface OperacionReciente {
    id: string;
    fecha: string | number;
    cliente: string;
    monto: number;
    tipoProducto: string;
    modelo: string;
    capacidad: string;
    color: string;
    auditoria: string;
    divisa?: string;
    tipo?: "Venta" | "Gasto";
}

export interface RankingProductos {
    name: string;
    cantidad: number;
    costo: number;
    monto: number;
}

// ==================== //
// == CATEGORIA DE CACHE == //
// ==================== //
export type CacheCategory = 'dashboard' | 'ventas' | 'operaciones' | 'config' | 'all';

export const DASHBOARD_KEY = 'dashboard';