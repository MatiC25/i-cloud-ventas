import React, { useState, useMemo } from 'react';
import {
    Wallet,
    Building2,
    CreditCard,
    Coins,
    BoxIcon,
    DollarSign,
    TrendingUp,
    MoreHorizontal,
    ChevronUp
} from 'lucide-react';
import { motion, Variants } from "framer-motion";

// --- SERVICIOS Y HOOKS ---
import { useEstadisticasDashboardCache } from '@/hooks/useEstadisticasDashboardCache';
import { getVentasCharts, getRecentOperations } from "@/services/api-back";
import { IChartsData } from '@/types';
import useSWR from 'swr';

// --- COMPONENTES UI ---
import { StatCard } from "@/components/ui/StatCard";
import { AccountItem } from "@/components/ui/AccountItem";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickActions } from "./QuickActions";
import { DailyGoalCard } from "./DailyGoalCard";
import { RecentOperationsTable, combineRecentOperations } from "./RecentOperationsTable";
import { TopSellersTable } from "./TopSellersTable";
import { TopProductsChart } from "./TopProductsChart";

// --- MODAL DE GRÁFICOS ---
import { SalesDetailsModal, ChartMetric } from "./SalesDetailsModal";
import { useSalesChartsCache } from '@/hooks/useSalesChartsCache';

// --- VARIANTES DE ANIMACIÓN ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 50, damping: 15 }
    }
};

export function DashboardV2() {
    // 1. Hook de Caché (Datos principales)
    const { stats, loading } = useEstadisticasDashboardCache();

    // 1b. Recent Operations (con los 3 tipos combinados)
    const { data: recentOpsRaw } = useSWR('recentOps-dashboard', () => getRecentOperations(10), {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    });
    const recentOperations = useMemo(() => {
        if (!recentOpsRaw) return [];
        return combineRecentOperations(recentOpsRaw, 15);
    }, [recentOpsRaw]);

    // 2. Estado del Modal de Gráficos
    const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
    const [modalMetric, setModalMetric] = useState<ChartMetric>('total');

    const [hasRequestedCharts, setHasRequestedCharts] = useState(false);
    const [showAllWallets, setShowAllWallets] = useState(false);

    const { chartsData, loadingCharts } = useSalesChartsCache(hasRequestedCharts);

    const handleOpenSalesModal = (metric: ChartMetric) => {
        setModalMetric(metric);
        setIsSalesModalOpen(true);
        setHasRequestedCharts(true);
    };

    const getWalletStyle = (name: string, currency: 'ARS' | 'USD') => {
        const lowerName = name.toLowerCase();
        let icon = currency === 'ARS' ? Wallet : Coins;
        let color = currency === 'ARS' ? "bg-blue-500" : "bg-green-600";

        if (currency === 'ARS') {
            if (lowerName.includes("banco") || lowerName.includes("galicia") || lowerName.includes("santander")) {
                icon = Building2;
                color = "bg-red-500";
            } else if (lowerName.includes("bru") || lowerName.includes("virtual") || lowerName.includes("mp")) {
                icon = Building2;
                color = "bg-purple-500";
            }
        } else {
            if (lowerName.includes("binance")) {
                icon = Coins;
                color = "bg-yellow-500";
            } else if (lowerName.includes("takenos")) {
                icon = CreditCard;
                color = "bg-orange-500";
            } else if (lowerName.includes("banco") || lowerName.includes("santander") || lowerName.includes("bbva")) {
                icon = Building2;
                color = "bg-blue-600";
            }
        }
        return { icon, color };
    };

    // 5. Agrupación de Cuentas (ARS vs USD)
    const seccionesCuentas = useMemo(() => {
        if (!stats) return { ars: [], usd: [] };

        const ars = Object.entries(stats.billeterasDetalle.ARS).map(([name, bal]) => ({
            name,
            bal,
            currency: 'ARS' as const,
            ...getWalletStyle(name, 'ARS')
        }));

        const usd = Object.entries(stats.billeterasDetalle.USD).map(([name, bal]) => ({
            name,
            bal,
            currency: 'USD' as const,
            ...getWalletStyle(name, 'USD')
        }));

        return { ars, usd };
    }, [stats]);

    // 6. Loading Skeleton
    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] dark:bg-slate-950 p-4 md:p-8 space-y-6">
                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64 rounded-lg" />
                        <Skeleton className="h-4 w-48 rounded-lg" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
                <Skeleton className="h-48 w-full rounded-3xl" />
                <div className="flex gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-[500px] rounded-3xl" />
                    <Skeleton className="h-[500px] col-span-2 rounded-3xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans p-4 md:p-8">

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
            >
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">IConnect Dashboard 2.0</h1>
                    <p className="text-gray-500 mt-1">Saldos de cuentas y rendimiento operativo.</p>
                </div>
            </motion.header>

            <motion.main
                className="max-w-7xl mx-auto space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Daily Goal */}
                <motion.div variants={itemVariants}>
                    <DailyGoalCard stats={stats} />
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <QuickActions />
                </motion.div>

                {/* --- GRIDS DE KPI (Tarjetas Superiores) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Capital ARS */}
                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Capital en Pesos"
                            value={`$${(stats?.saldoARS || 0)?.toLocaleString()}`}
                            icon={Wallet}
                            color="bg-blue-500"
                            subtext="Saldo actual"
                        />
                    </motion.div>

                    {/* Capital USD */}
                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Capital en Dólares"
                            value={`$${(stats?.saldoUSD || 0)?.toLocaleString()}`}
                            icon={Wallet}
                            color="bg-blue-500"
                            subtext="Saldo actual"
                        />
                    </motion.div>

                    {/* KPI INTERACTIVO: CANTIDAD DE VENTAS */}
                    <motion.div variants={itemVariants}>
                        <div
                            onClick={() => handleOpenSalesModal('count')}
                            className="cursor-pointer transition-all hover:scale-[1.03] active:scale-95 group relative"
                        >
                            <StatCard
                                title="Cantidad de Ventas"
                                value={stats?.stats.hoy.count || 0}
                                icon={BoxIcon}
                                color="bg-blue-500"
                                subtext="Ventas hoy (Ver Detalle)"
                            />
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                                <TrendingUp size={18} />
                            </div>
                        </div>
                    </motion.div>

                    {/* KPI INTERACTIVO: PROFIT */}
                    <motion.div variants={itemVariants}>
                        <div
                            onClick={() => handleOpenSalesModal('profit')}
                            className="cursor-pointer transition-all hover:scale-[1.03] active:scale-95 group relative"
                        >
                            <StatCard
                                title="Profit"
                                value={`$${(stats?.stats.mes.profit || 0)?.toLocaleString()}`}
                                icon={DollarSign}
                                color="bg-emerald-500"
                                subtext="Profit de Mes (Ver Detalle)"
                            />
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500">
                                <TrendingUp size={18} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col gap-6">

                    {/* 1. FILA SUPERIOR: LISTAS DE CUENTAS (ARS | USD) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Lista ARS */}
                        <motion.div variants={itemVariants} className="bg-[#1A1F2C] text-white rounded-3xl p-5 shadow-lg border border-slate-800">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pesos Argentinos</h3>
                                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-gray-300">Total: ${stats?.saldoARS?.toLocaleString()}</span>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                {seccionesCuentas.ars.map((cuenta) => (
                                    <div key={cuenta.name} className="flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-xl transition-colors group">
                                        <div className="flex items-center gap-3">
                                            {/* Icono circular pequeño */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cuenta.color} text-white`}>
                                                <cuenta.icon size={14} />
                                            </div>
                                            <span className="font-medium text-sm text-gray-200">{cuenta.name}</span>
                                        </div>
                                        <span className="font-semibold text-sm tracking-wide text-white">
                                            ${cuenta.bal.toLocaleString()} <span className="text-[10px] text-gray-500">ARS</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Lista USD */}
                        <motion.div variants={itemVariants} className="bg-[#1A1F2C] text-white rounded-3xl p-5 shadow-lg border border-slate-800">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dólares</h3>
                                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-gray-300">Total: ${stats?.saldoUSD?.toLocaleString()}</span>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                {seccionesCuentas.usd.map((cuenta) => (
                                    <div key={cuenta.name} className="flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cuenta.color} text-white`}>
                                                <cuenta.icon size={14} />
                                            </div>
                                            <span className="font-medium text-sm text-gray-200">{cuenta.name}</span>
                                        </div>
                                        <span className="font-semibold text-sm tracking-wide text-white">
                                            ${cuenta.bal.toLocaleString()} <span className="text-[10px] text-gray-500">USD</span>
                                        </span>
                                    </div>
                                ))}
                                {/* Si está vacío */}
                                {seccionesCuentas.usd.length === 0 && (
                                    <div className="py-10 text-center text-gray-500 text-sm">No hay cuentas en USD activas</div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* 2. FILA INFERIOR: BENTO GRID VISUAL (Bloques de colores) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Bloque Grande Izquierdo: Total ARS Principal */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-[#0f3460] lg:col-span-1 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-xl"
                        >
                            <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                            <div className="flex items-center gap-2 text-blue-200 mb-2">
                                <img src="https://flagcdn.com/ar.svg" alt="AR" className="w-5 h-5 rounded-full object-cover" />
                                <span className="text-sm font-medium">Pesos Arg Total</span>
                            </div>

                            <div>
                                <h2 className="text-4xl font-bold text-white tracking-tight">
                                    ${(stats?.saldoARS || 0).toLocaleString()}
                                </h2>
                                <p className="text-blue-200/60 text-sm mt-1">Capital operativo disponible</p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 flex gap-4">
                                <button className="text-xs bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-lg text-white font-medium">
                                    Ver Movimientos
                                </button>
                            </div>
                        </motion.div>

                        {/* Grid Derecha: Tarjetas de Colores (Bento) */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">

                            {/* Mapeamos las cuentas (5 o todas según el estado) */}
                            {seccionesCuentas.ars.slice(0, showAllWallets ? undefined : 5).map((cuenta) => (
                                <div
                                    key={cuenta.name}
                                    className={`${cuenta.color} rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:brightness-110 transition-all cursor-default text-white relative overflow-hidden min-h-[120px]`}
                                >
                                    {/* Un poco de brillo decorativo */}
                                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-white opacity-10 rounded-full blur-xl"></div>

                                    <div className="flex justify-between items-start z-10">
                                        <span className="text-[13px] font-medium opacity-90 truncate max-w-[80%]">{cuenta.name}</span>
                                        <cuenta.icon size={16} className="opacity-70" />
                                    </div>

                                    <div className="z-10 mt-2">
                                        <span className="text-lg font-bold tracking-tight block">
                                            ${cuenta.bal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Tarjeta "Ver más/menos" si hay muchas cuentas */}
                            {seccionesCuentas.ars.length > 5 && (
                                <div
                                    onClick={() => setShowAllWallets(!showAllWallets)}
                                    className="bg-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center shadow-lg hover:bg-slate-700 transition-all cursor-pointer text-gray-400 border border-slate-700 border-dashed min-h-[120px]"
                                >
                                    {showAllWallets ? (
                                        <>
                                            <ChevronUp size={24} />
                                            <span className="text-xs mt-2 font-medium">Ver menos</span>
                                        </>
                                    ) : (
                                        <>
                                            <MoreHorizontal size={24} />
                                            <span className="text-xs mt-2 font-medium">Ver {seccionesCuentas.ars.length - 5} más</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Tarjeta Resumen USD Compacta dentro del Bento (opcional, para llenar espacio) */}
                            <div className="bg-red-900/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg text-white relative overflow-hidden min-h-[120px] border border-red-700/50">
                                <div className="flex justify-between items-start z-10">
                                    <span className="text-[13px] font-medium opacity-90">Total USD</span>
                                    <DollarSign size={16} className="opacity-70" />
                                </div>
                                <div className="z-10">
                                    <span className="text-lg font-bold tracking-tight block">
                                        ${(stats?.saldoUSD || 0).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] opacity-60">En {seccionesCuentas.usd.length} cuentas</span>
                                </div>
                            </div>

                        </motion.div>
                    </div>

                </div>

                {/* TABLAS INFERIORES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                    <motion.div variants={itemVariants}>
                        <TopSellersTable topSellers={stats?.topVendedores || []} />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <TopProductsChart topProducts={stats?.rankingProductos || []} />
                    </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                    <RecentOperationsTable operations={recentOperations} />
                </motion.div>
            </motion.main>

            {/* --- COMPONENTE MODAL (Se renderiza al final) --- */}
            <SalesDetailsModal
                isOpen={isSalesModalOpen}
                onClose={() => setIsSalesModalOpen(false)}
                data={chartsData} // Viene directo del hook
                isLoading={loadingCharts} // Viene directo del hook
                activeMetric={modalMetric}
            />
        </div>
    );
}