import { RefreshCcw, Wallet, Building2, Coins, CreditCard, TrendingUp, Package, ArrowUpRight, ArrowDownRight, ArrowDownCircle } from "lucide-react"
import { triggerCacheRebuild, getDashboardStats } from "@/services/api-back"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Pencil, X, Check } from "lucide-react"
import { IDashboardStats } from "@/types"
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart, Pie, Cell
} from "recharts"
import { format, parseISO } from "date-fns"
import { motion } from "framer-motion"
import { FireworksBackground } from "@/components/ui/fireworks"
import { QuickActions } from "./QuickActions"
import { CACHE } from "@/services/api-back"

// --- Helper Components for List Items ---
const AccountItem = ({ name, balance, currency, icon: Icon, color }: any) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <div className="flex items-center gap-3">
            <div className={`p-2 ${color} text-white rounded-lg shadow-sm`}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{name}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{currency}</p>
            </div>
        </div>
        <div className="text-right">
            <p className={`text-xs font-bold ${balance < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                {currency === 'USD' ? 'US$ ' : '$'}{balance.toLocaleString()}
            </p>
        </div>
    </div>
);

export function EstadisticasBasicas() {
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [stats, setStats] = useState<IDashboardStats | null>(null)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await triggerCacheRebuild()
            if (CACHE) delete CACHE.dashboardStats;
            const data = await getDashboardStats(true)
            if (data) setStats(data)
        } catch (error) {
            console.error("Error refreshing dashboard:", error)
        } finally {
            setIsRefreshing(false)
        }
    }

    // Daily Goal State
    const [dailyGoal, setDailyGoal] = useState(500000)
    const [isEditingGoal, setIsEditingGoal] = useState(false)
    const [tempGoal, setTempGoal] = useState("")

    useEffect(() => {
        const savedGoal = localStorage.getItem("dashboard_daily_goal")
        if (savedGoal) {
            setDailyGoal(Number(savedGoal))
        }

        async function fetchData() {
            setLoading(true)
            try {
                const data = await getDashboardStats()
                if (data) setStats(data)
            } catch (error) {
                console.error("Error fetching dashboard stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSaveGoal = () => {
        const val = Number(tempGoal)
        if (!isNaN(val) && val > 0) {
            setDailyGoal(val)
            localStorage.setItem("dashboard_daily_goal", String(val))
            setIsEditingGoal(false)
        }
    }

    // Calculate goal progress based on today's chart data if available
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const todayData = stats?.chartData?.find(d => d.date === todayStr) || { income: 0 }
    const lastDayVentas = todayData.income || 0 // Use 'income' from new chart structure
    const progressPercentage = Math.min((lastDayVentas / dailyGoal) * 100, 100)
    const goalMet = lastDayVentas >= dailyGoal

    // Prepare Account Data Breakdown
    const cuentas = [];
    if (stats?.billeterasDetalle) {
        // ARS
        Object.entries(stats.billeterasDetalle.ARS || {}).forEach(([name, balance]) => {
            if (balance !== 0) {
                let Icon = Wallet;
                let color = "bg-blue-500";
                if (name.toLowerCase().includes("banco") || name.toLowerCase().includes("galicia") || name.toLowerCase().includes("santander")) { Icon = Building2; color = "bg-red-500"; }
                if (name.toLowerCase().includes("bru") || name.toLowerCase().includes("virtual")) { Icon = Building2; color = "bg-purple-500"; }
                cuentas.push({ name, balance, currency: 'ARS', icon: Icon, color });
            }
        });
        // USD
        Object.entries(stats.billeterasDetalle.USD || {}).forEach(([name, balance]) => {
            if (balance !== 0) {
                let Icon = Coins;
                let color = "bg-green-600";
                if (name.toLowerCase().includes("binance")) { Icon = Coins; color = "bg-yellow-500"; }
                if (name.toLowerCase().includes("takenos")) { Icon = CreditCard; color = "bg-orange-500"; }
                if (name.toLowerCase().includes("banco") || name.toLowerCase().includes("santander") || name.toLowerCase().includes("bbva")) { Icon = Building2; color = "bg-blue-600"; }
                cuentas.push({ name, balance, currency: 'USD', icon: Icon, color });
            }
        });
    }

    // Categorias Colors
    const COLORS = ['#007AFF', '#5856D6', '#FF9500', '#FF2D55', '#10B981', '#F59E0B'];
    const categorias = (stats?.categorias || []).map((c, i) => ({
        ...c,
        color: COLORS[i % COLORS.length]
    }));

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }
    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    if (loading || !stats) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="col-span-2 row-span-2 h-[200px]" />
                    <Skeleton className="h-[200px]" />
                    <Skeleton className="h-[200px]" />
                </div>
            </div>
        )
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

            {/* Quick Actions & Refresh */}
            <motion.div variants={item} className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <QuickActions />
                </div>
                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="mt-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
                    <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
            </motion.div>

            {/* MAIN GRID */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                {/* 1. OBJETIVO DIARIO (Preserved) */}
                <motion.div variants={item} className="col-span-2 row-span-2 relative group">
                    <Card className="h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg overflow-hidden relative">
                        {goalMet && (
                            <div className="absolute inset-0 z-0 pointer-events-none">
                                <FireworksBackground population={40} />
                            </div>
                        )}
                        <div className="absolute right-4 top-4 opacity-10">
                            <Target className="w-24 h-24" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-medium text-slate-200 flex items-center gap-2">
                                    <Target className={`h-5 w-5 ${goalMet ? 'text-yellow-400' : 'text-emerald-400'}`} />
                                    Objetivo Diario
                                </CardTitle>
                                {goalMet && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 animate-pulse">
                                        ¡META ALCANZADA!
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold mb-4">
                                {lastDayVentas.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
                            </div>
                            <div className="mb-2 text-sm text-slate-400 flex flex-col gap-2">
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Meta:</span>
                                        {isEditingGoal ? (
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    autoFocus
                                                    type="number"
                                                    className="h-7 w-28 bg-slate-800 border-slate-700 text-white text-xs"
                                                    value={tempGoal}
                                                    onChange={(e) => setTempGoal(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                                                />
                                                <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-emerald-500/20 hover:text-emerald-400" onClick={handleSaveGoal}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-red-500/20 hover:text-red-400" onClick={() => setIsEditingGoal(false)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-slate-300 font-bold">${dailyGoal.toLocaleString()}</span>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500 hover:text-white" onClick={() => { setTempGoal(String(dailyGoal)); setIsEditingGoal(true); }}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Progress value={progressPercentage} className="h-2 bg-slate-700" indicatorClassName={goalMet ? 'bg-emerald-500' : 'bg-blue-500'} />
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>${lastDayVentas.toLocaleString()}</span>
                                    <span>{Math.round(progressPercentage)}%</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4 mt-2">
                                {/* ARS Breakdown */}
                                <div>
                                    <h4 className="text-xs font-semibold text-indigo-500 mb-2 flex items-center justify-between">
                                        🇦🇷 ARS
                                        <span>
                                            {(Object.values(stats.billeterasDetalle?.ARS || {}).reduce((a: number, b: number) => a + b, 0)).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}
                                        </span>
                                    </h4>
                                    <div className="space-y-1.5 pl-2 border-l-2 border-indigo-500/20">
                                        {Object.entries(stats.billeterasDetalle?.ARS || {}).map(([cuenta, monto]) => (
                                            (monto as number) !== 0 && (
                                                <div key={cuenta} className="flex justify-between text-xs text-slate-400">
                                                    <span>{cuenta}</span>
                                                    <span className="font-mono text-slate-200">{(monto as number).toLocaleString("es-AR")}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>

                                {/* USD Breakdown */}
                                <div>
                                    <h4 className="text-xs font-semibold text-emerald-500 mb-2 flex items-center justify-between">
                                        🇺🇸 USD
                                        <span>
                                            {(Object.values(stats.billeterasDetalle?.USD || {}).reduce((a: number, b: number) => a + b, 0)).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                                        </span>
                                    </h4>
                                    <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500/20">
                                        {Object.entries(stats.billeterasDetalle?.USD || {}).map(([cuenta, monto]) => (
                                            (monto as number) !== 0 && (
                                                <div key={cuenta} className="flex justify-between text-xs text-slate-400">
                                                    <span>{cuenta}</span>
                                                    <span className="font-mono text-slate-200">{(monto as number).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 3. GASTOS DEL MES (Desglose) */}
                <motion.div variants={item}>
                    <Card className="overflow-hidden relative border-none shadow-md bg-white dark:bg-slate-950 h-full">
                        <div className="absolute inset-0 bg-rose-100/50 dark:bg-rose-950/40 pointer-events-none" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-rose-900 dark:text-rose-100">Gastos del Mes</CardTitle>
                            <ArrowDownCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 mb-2">
                                {(stats.expensesPie?.reduce((a, b) => a + b.value, 0) || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                            </div>

                            {/* Breakdown List */}
                            <div className="space-y-1">
                                {(stats.expensesPie || []).slice(0, 5).map((item) => (
                                    <div key={item.name} className="flex justify-between text-xs items-center">
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                            <span className="truncate max-w-[120px] text-slate-600 dark:text-slate-300" title={item.name}>{item.name}</span>
                                        </div>
                                        <span className="font-mono text-slate-700 dark:text-slate-200">
                                            {item.value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                ))}
                                {(!stats.expensesPie || stats.expensesPie.length === 0) && (
                                    <p className="text-xs text-slate-400 italic">Sin gastos registrados este mes</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 3. CHART - Income vs Profit */}
                <motion.div variants={item} className="col-span-2 lg:col-span-2">
                    <Card className="shadow-sm border border-slate-200 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Flujo de Caja (30 días)</CardTitle>
                            <div className="flex gap-2">
                                <span className="flex items-center text-[10px] text-slate-500"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>Ingresos</span>
                                <span className="flex items-center text-[10px] text-slate-500"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>Profit</span>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="date" hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "white", fontSize: "12px" }}
                                        formatter={(val: number | undefined) => [`$${(val || 0).toLocaleString()}`, ""]}
                                    />
                                    <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 4. EXPENSES SUMMARY & TOP PRODUCTS SPLIT */}
                <motion.div variants={item} className="col-span-2 lg:col-span-2 grid grid-cols-2 gap-4">
                    {/* Expenses Pie */}
                    <Card className="shadow-sm border border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                                Gastos ({stats.expensesPie?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[150px] relative">
                            <div className="absolute top-2 right-2 text-xl font-bold text-rose-600">
                                {stats.gastosMensuales?.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.expensesPie} innerRadius={40} outerRadius={55} paddingAngle={2} dataKey="value">
                                        {stats.expensesPie?.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Top Product Hero */}
                    <Card className="shadow-sm border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-slate-950">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Top Seller
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center pt-2">
                            {stats.topProductos && stats.topProductos[0] ? (
                                <>
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-2">
                                        <Package className="h-6 w-6 text-indigo-500" />
                                    </div>
                                    <p className="font-semibold text-sm text-center line-clamp-2">{stats.topProductos[0].name}</p>
                                    <p className="text-xs text-slate-500">{stats.topProductos[0].sales} vendidas</p>
                                    <p className="text-xs font-bold text-indigo-600 mt-1">
                                        +${(stats.topProductos[0].profit || 0).toLocaleString()}
                                    </p>
                                </>
                            ) : (
                                <p className="text-xs text-slate-400">Sin datos de ventas</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </motion.div>
    )
}
