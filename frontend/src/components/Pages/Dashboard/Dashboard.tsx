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
    Package
} from 'lucide-react';

// Asegúrate de que estas rutas sean correctas en tu proyecto
import { getDashboardStats, triggerCacheRebuild, getLiveBalances } from "@/services/api-back";
import { IDashboardStats, IBalanceResponse } from "@/types"; // Asumo que IDashboardStats ya existe
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { QuickActions } from "./QuickActions";
import { TablaOperaciones } from "@/components/Pages/Estadisticas/TablaOperaciones";
import { DailyGoalCard } from "./DailyGoalCard";

// --- INTERFACES ---

// Esta interfaz coincide con lo que devuelve tu método estático getLiveBalances

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, trend, subtext }: any) => (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-50 dark:bg-slate-900 rounded-xl">
                <Icon size={20} className="text-gray-600 dark:text-gray-300" />
            </div>
            {trend !== undefined && (
                <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    {Math.abs(trend)}%
                </span>
            )}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{value}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{subtext}</p>
        </div>
    </div>
);

const AccountItem = ({ name, balance, currency, icon: Icon, color }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
        <div className="flex items-center gap-3">
            <div className={`p-2.5 ${color} text-white rounded-xl shadow-sm`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{name}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{currency}</p>
            </div>
        </div>
        <div className="text-right">
            <p className={`text-sm font-bold ${balance < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                {currency === 'USD' ? 'US$ ' : '$'}{balance.toLocaleString()}
            </p>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export function Dashboard() {
    const [stats, setStats] = useState<IDashboardStats | null>(null);
    const [balances, setBalances] = useState<IBalanceResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async (forceRewrite = false) => {
        try {
            if (forceRewrite) {
                setRefreshing(true);
                await triggerCacheRebuild();
            }

            // Llamamos a ambas APIs en paralelo
            const [statsData, liveBalancesData] = await Promise.all([
                getDashboardStats(forceRewrite),
                getLiveBalances()
            ]);

            console.log(statsData);
            console.log(liveBalancesData);

            if (statsData) setStats(statsData);
            if (liveBalancesData) setBalances(liveBalancesData);

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- TRANSFORM DATA ---

    // Priorizamos la data en vivo (balances) para las cuentas, si no existe usamos un objeto vacío por seguridad
    const sourceBalances = balances || { billeterasDetalle: { ARS: {}, USD: {} }, saldoARS: 0, saldoUSD: 0 };

    const cuentas: { name: string; balance: number; currency: string; icon: any; color: string }[] = [];

    // 1. Procesar Cuentas en ARS
    Object.entries(sourceBalances.billeterasDetalle?.ARS || {}).forEach(([name, balance]) => {
        if (Number(balance) !== 0) {
            let Icon = Wallet;
            let color = "bg-blue-500";
            if (name.toLowerCase().includes("banco") || name.toLowerCase().includes("galicia") || name.toLowerCase().includes("santander")) { Icon = Building2; color = "bg-red-500"; }
            if (name.toLowerCase().includes("bru") || name.toLowerCase().includes("virtual") || name.toLowerCase().includes("mp")) { Icon = Building2; color = "bg-purple-500"; }

            cuentas.push({ name, balance: Number(balance), currency: 'ARS', icon: Icon, color });
        }
    });

    // 2. Procesar Cuentas en USD
    Object.entries(sourceBalances.billeterasDetalle?.USD || {}).forEach(([name, balance]) => {
        if (Number(balance) !== 0) {
            let Icon = Coins;
            let color = "bg-green-600";
            if (name.toLowerCase().includes("binance")) { Icon = Coins; color = "bg-yellow-500"; }
            if (name.toLowerCase().includes("takenos")) { Icon = CreditCard; color = "bg-orange-500"; }
            if (name.toLowerCase().includes("banco") || name.toLowerCase().includes("santander") || name.toLowerCase().includes("bbva")) { Icon = Building2; color = "bg-blue-600"; }

            cuentas.push({ name, balance: Number(balance), currency: 'USD', icon: Icon, color });
        }
    });

    // 3. Chart Data (Viene de stats históricos)
    const graficoVentas = stats?.chartData || [];

    // 4. Categorias y Colores
    const COLORS = ['#007AFF', '#5856D6', '#FF9500', '#FF2D55', '#10B981', '#F59E0B'];
    const categorias = (stats?.categorias || []).map((c, i) => ({
        ...c,
        color: COLORS[i % COLORS.length]
    }));

    // 5. Top Productos
    const topProductos = (stats?.topProductos || []).map(p => ({
        name: p.name,
        sales: p.sales,
        profit: p.profit
    }));

    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans p-4 md:p-8">
            {/* Header */}
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">IConnect Dashboard</h1>
                    <p className="text-gray-500 mt-1">Saldos de cuentas y rendimiento operativo.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => loadData(true)}
                        disabled={refreshing}
                        className="rounded-full"
                    >
                        <Filter size={16} className="mr-2" />
                        {refreshing ? "Actualizando..." : "Actualizar Cache"}
                    </Button>
                    <button className="flex items-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm">
                        <Download size={16} className="mr-2" /> Reporte Cajas
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-6">

                {/* Daily Goal - Top Hero */}
                <DailyGoalCard stats={stats} />

                {/* Quick Actions - Always Visible */}
                <QuickActions />

                {loading ? (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-[24px]" />)}
                        </div>
                        <Skeleton className="h-[400px] rounded-[32px]" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Skeleton className="lg:col-span-2 h-[300px] rounded-[32px]" />
                            <Skeleton className="h-[300px] rounded-[32px]" />
                        </div>
                    </div>
                ) : (!stats && !balances) ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-[32px]">No hay datos disponibles</div>
                ) : (
                    <>
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Capital en Pesos"
                                value={`$${(balances?.saldoARS || 0).toLocaleString()}`}
                                icon={Wallet}
                                subtext="Saldo actual en vivo"
                            />
                            <StatCard
                                title="Capital en Dólares"
                                value={`US$ ${(balances?.saldoUSD || 0).toLocaleString()}`}
                                icon={Coins}
                                subtext="Saldo actual en vivo"
                            />
                            <StatCard
                                title="Profit del Mes"
                                value={`US$ ${(stats?.profitMensual || 0).toLocaleString()}`}
                                icon={TrendingUp}
                                trend={stats?.tendenciaProfit}
                                subtext="En base a ventas USD"
                            />
                            <StatCard
                                title="Órdenes"
                                value={stats?.totalOrdenes || 0}
                                icon={ShoppingCart}
                                subtext="Ventas totales registradas"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Detailed Account Balances */}
                            <div className="lg:col-span-4 bg-white dark:bg-slate-950 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold">Saldos por Cuenta</h3>
                                        <p className="text-sm text-gray-400">Desglose por entidad</p>
                                    </div>
                                    <Wallet size={20} className="text-gray-300" />
                                </div>
                                <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                                    {/* Pesos Section */}
                                    <div className="mb-4">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Pesos (ARS)</p>
                                        <div className="space-y-2">
                                            {cuentas.filter(c => c.currency === 'ARS').map((cuenta, i) => (
                                                <AccountItem key={i} {...cuenta} />
                                            ))}
                                            {cuentas.filter(c => c.currency === 'ARS').length === 0 && <span className="text-xs text-gray-400 ml-1">Sin saldos en ARS</span>}
                                        </div>
                                    </div>
                                    {/* USD Section */}
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Dólares (USD)</p>
                                        <div className="space-y-2">
                                            {cuentas.filter(c => c.currency === 'USD').map((cuenta, i) => (
                                                <AccountItem key={i} {...cuenta} />
                                            ))}
                                            {cuentas.filter(c => c.currency === 'USD').length === 0 && <span className="text-xs text-gray-400 ml-1">Sin saldos en USD</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-50 dark:border-slate-900">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 font-medium">Patrimonio Neto Est.</span>
                                        {/* Cálculo aproximado con dolar a 1200, ajustable según lógica de negocio */}
                                        <span className="text-lg font-bold text-black dark:text-white">
                                            US$ {((balances?.saldoUSD || 0) + ((balances?.saldoARS || 0) / 1200)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Chart */}
                            <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-lg font-semibold">Flujo de Caja</h3>
                                        <p className="text-sm text-gray-400">Ingresos vs Profit (Últimos 30 días)</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="flex items-center text-xs text-gray-500 font-medium">
                                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span> Ingresos
                                        </span>
                                        <span className="flex items-center text-xs text-gray-500 font-medium">
                                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span> Profit
                                        </span>
                                    </div>
                                </div>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={graficoVentas} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                dy={10}
                                                tickFormatter={(val) => {
                                                    if (!val) return "";
                                                    const parts = val.split('-');
                                                    if (parts.length < 3) return val;
                                                    return `${parts[2]}/${parts[1]}`;
                                                }}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="income" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                            <Area type="monotone" dataKey="profit" stroke="#34C759" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Top Products */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800">
                                <h3 className="text-lg font-semibold mb-6">Equipos Más Vendidos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {topProductos.map((prod, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white dark:bg-black rounded-xl flex items-center justify-center shadow-sm">
                                                    <Package size={20} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{prod.name}</h4>
                                                    <p className="text-xs text-gray-400">{prod.sales} Unidades</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-green-600">+${(prod.profit || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {topProductos.length === 0 && <span className="text-sm text-gray-500">No hay datos de productos este mes.</span>}
                                </div>
                            </div>

                            {/* Categories Chart */}
                            <div className="bg-white dark:bg-slate-950 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center">
                                <h3 className="text-lg font-semibold w-full text-left mb-6">Mix de Ventas</h3>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categorias}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={10}
                                                dataKey="value"
                                            >
                                                {categorias.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full mt-6 grid grid-cols-2 gap-3">
                                    {categorias.map((cat, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                            <span className="text-xs font-medium text-gray-500">{cat.name} ({cat.value}%)</span>
                                        </div>
                                    ))}
                                    {categorias.length === 0 && <span className="text-xs text-gray-400">Sin datos</span>}
                                </div>
                            </div>
                        </div>

                        {/* Tabla de Operaciones */}
                        <TablaOperaciones />
                    </>
                )}

            </main>
        </div>
    );
}