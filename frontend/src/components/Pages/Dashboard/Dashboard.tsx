import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download,
    Wallet,
    Building2,
    CreditCard,
    Coins,
    Package,
    BoxIcon,
    DollarSign
} from 'lucide-react';
import { motion, Variants } from "framer-motion";
import { checkCacheStatus } from "@/services/api-back";

// Asegúrate de que estas rutas sean correctas en tu proyecto
import { getDashboardStats, triggerCacheRebuild, getLiveBalances } from "@/services/api-back";
import { IDashboardStats, IBalanceResponse, IDashboardStatsResponse } from "@/types"; // Asumo que IDashboardStats ya existe
// Imports from Shadcn/UI and other components
import { StatCard } from "@/components/ui/StatCard";
import { AccountItem } from "@/components/ui/AccountItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { QuickActions } from "./QuickActions";
import { TablaOperaciones } from "@/components/Pages/Estadisticas/TablaOperaciones";
import { DailyGoalCard } from "./DailyGoalCard";
import { RecentOperationsTable } from "./RecentOperationsTable";
import { TopSellersTable } from "./TopSellersTable";
import { TopProductsChart } from "./TopProductsChart";
import { useEstadisticasDashboardCache } from '@/hooks/useEstadisticasDashboardCache';
import { useMemo } from 'react';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Efecto cascada entre elementos
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

export function Dashboard() {
    const { stats, loading, isRefreshing, error, mutate } = useEstadisticasDashboardCache();
    const [refreshing, setRefreshing] = useState(false);

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


    const seccionesCuentas = useMemo(() => {
        console.log(stats);
        if (!stats) return { ars: [], usd: [] };

        const ars = Object.entries(stats.billeterasDetalle.ARS).map(([name, bal]) => ({
            name,
            bal,
            currency: 'ARS',
            ...getWalletStyle(name, 'ARS')
        }));

        const usd = Object.entries(stats.billeterasDetalle.USD).map(([name, bal]) => ({
            name,
            bal,
            currency: 'USD',
            ...getWalletStyle(name, 'USD')
        }));

        return { ars, usd };
    }, [stats]);

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

                {/* Hero Skeleton */}
                <Skeleton className="h-48 w-full rounded-3xl" />

                {/* Quick Actions Skeleton */}
                <div className="flex gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                </div>

                {/* Grid Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>

                {/* Lists Skeleton */}
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
                    <h1 className="text-3xl font-semibold tracking-tight">IConnect Dashboard</h1>
                    <p className="text-gray-500 mt-1">Saldos de cuentas y rendimiento operativo.</p>
                </div>

            </motion.header>


            <motion.main
                className="max-w-7xl mx-auto space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Daily Goal - Top Hero */}
                <motion.div variants={itemVariants}>
                    <DailyGoalCard stats={stats} />
                </motion.div>

                {/* Quick Actions - Always Visible */}
                <motion.div variants={itemVariants}>
                    <QuickActions />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Capital en Pesos"
                            value={`$${(stats?.saldoARS || 0)?.toLocaleString()}`}
                            icon={Wallet}
                            color="bg-blue-500"
                            subtext="Saldo actual"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Capital en Dólares"
                            value={`$${(stats?.saldoUSD || 0)?.toLocaleString()}`}
                            icon={Wallet}
                            color="bg-blue-500"
                            subtext="Saldo actual"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Cantidad de Ventas"
                            value={stats?.stats.hoy.count || 0}
                            icon={BoxIcon}
                            color="bg-blue-500"
                            subtext="Ventas hoy"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <StatCard
                            title="Profit"
                            value={`$${(stats?.stats.hoy.profit || 0)?.toLocaleString()}`}
                            icon={DollarSign}
                            color="bg-blue-500"
                            subtext="Profit del Día"
                        />
                    </motion.div>


                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna Izquierda: Cuentas */}
                    <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">

                        <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 h-[600px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">

                            {/* Sección ARS */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Pesos Argentinos</h3>
                                <div className="space-y-3">
                                    {seccionesCuentas.ars.map((cuenta, i) => (
                                        <AccountItem
                                            key={cuenta.name}
                                            name={cuenta.name}
                                            balance={cuenta.bal}
                                            currency={cuenta.currency}
                                            icon={cuenta.icon}
                                            color={cuenta.color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Sección USD */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Dólares</h3>
                                <div className="space-y-3">
                                    {seccionesCuentas.usd.map((cuenta, i) => (
                                        <AccountItem
                                            key={cuenta.name}
                                            name={cuenta.name}
                                            balance={cuenta.bal}
                                            currency={cuenta.currency}
                                            icon={cuenta.icon}
                                            color={cuenta.color}
                                        />
                                    ))}
                                </div>
                            </div>

                        </div>
                    </motion.div>

                    {/* Columna Derecha: Gráfico (Placeholder por ahora) */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-950 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-800 h-[600px] flex flex-col">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold tracking-tight">Rendimiento Financiero</h2>
                                <p className="text-sm text-gray-500">Evolución de capital y ventas del mes.</p>
                            </div>

                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
                                <div className="text-center text-gray-400">
                                    <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Espacio reservado para Gráfico</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                    <motion.div variants={itemVariants}>
                        <TopSellersTable topSellers={stats?.topVendedores || []} />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <TopProductsChart topProducts={stats?.rankingProductos || []} />
                    </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                    <RecentOperationsTable operations={stats?.ultimasOperaciones || []} />
                </motion.div>

            </motion.main>
        </div>
    );
}   