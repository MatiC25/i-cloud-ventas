import { RefreshCcw, Wallet, Building2, Coins, CreditCard, Target, Pencil, X, Check, Users, History, TrendingUp, CalendarDays, ArrowUpRight } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { FireworksBackground } from "@/components/ui/fireworks"
import { QuickActions } from "./QuickActions"
import { useEstadisticasDashboardCache } from "@/hooks/useEstadisticasDashboardCache"

// --- Helper simple para moneda ---
const formatMoney = (amount: number, currency: 'ARS' | 'USD') => {
    return new Intl.NumberFormat(currency === 'ARS' ? 'es-AR' : 'en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(amount);
};

export function EstadisticasBasicas2() {
    // Usamos el hook corregido
    const { stats, loading, isRefreshing, reload } = useEstadisticasDashboardCache();

    // Estado local para Meta Diaria (Persistencia básica en navegador)
    const [dailyGoal, setDailyGoal] = useState(500000);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState("");

    useEffect(() => {
        const savedGoal = localStorage.getItem("dashboard_daily_goal");
        if (savedGoal) setDailyGoal(Number(savedGoal));
    }, []);

    const handleSaveGoal = () => {
        const val = Number(tempGoal);
        if (!isNaN(val) && val > 0) {
            setDailyGoal(val);
            localStorage.setItem("dashboard_daily_goal", String(val));
            setIsEditingGoal(false);
        }
    };

    // --- Mapeo Directo de Datos del Backend ---
    // Ya no calculamos nada, confiamos en stats.hoy.total que viene del servidor
    const ventasHoy = stats?.stats?.hoy?.total || 0; 
    const progressPercentage = Math.min((ventasHoy / dailyGoal) * 100, 100);
    const goalMet = ventasHoy >= dailyGoal;

    // Variantes de animación
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    // Estado de Carga / Error
    if (loading || !stats) {
        return (
            <div className="space-y-4 p-1">
                <div className="flex justify-between mb-6"><Skeleton className="h-10 w-40" /><Skeleton className="h-10 w-10" /></div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="col-span-2 row-span-2 h-[300px] rounded-xl" />
                    <Skeleton className="h-[140px] rounded-xl" />
                    <Skeleton className="h-[140px] rounded-xl" />
                    <Skeleton className="col-span-2 h-[140px] rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

            {/* Header: Acciones Rápidas y Refrescar */}
            <motion.div variants={item} className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <QuickActions />
                </div>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={reload} 
                    disabled={isRefreshing} 
                    className="mt-1 bg-white/80 dark:bg-slate-900/50 backdrop-blur border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                    <RefreshCcw className={`h-4 w-4 text-slate-600 dark:text-slate-400 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
                </Button>
            </motion.div>

            {/* Grid Principal */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                {/* 1. TARJETA HERO: OBJETIVO DIARIO */}
                <motion.div variants={item} className="col-span-2 row-span-2 relative group">
                    <Card className="h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl overflow-hidden relative transition-all hover:shadow-2xl ring-1 ring-white/10">
                        {goalMet && (
                            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                                <FireworksBackground population={40} />
                            </div>
                        )}
                        <div className="absolute right-[-20px] top-[-20px] opacity-5 rotate-12 pointer-events-none">
                            <Target className="w-48 h-48" />
                        </div>
                        
                        <CardHeader className="pb-2 relative z-10">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-medium text-slate-200 flex items-center gap-2">
                                    <Target className={`h-5 w-5 ${goalMet ? 'text-yellow-400' : 'text-emerald-400'}`} />
                                    Objetivo Diario
                                </CardTitle>
                                {goalMet && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                        ¡LOGRADO!
                                    </span>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="relative z-10 flex flex-col justify-between h-[80%] pt-6">
                            <div>
                                <div className="text-5xl md:text-6xl font-bold mb-2 tracking-tight text-white drop-shadow-sm">
                                    {formatMoney(ventasHoy, 'USD')}
                                </div>
                                <p className="text-slate-400 text-sm mb-8 flex items-center gap-2">
                                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                    Ventas acumuladas hoy
                                </p>
                                
                                <div className="relative pt-2">
                                    <Progress 
                                        value={progressPercentage} 
                                        className="h-3 bg-slate-700/50 backdrop-blur-sm" 
                                        indicatorClassName={`transition-all duration-1000 ${goalMet ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} 
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                                        <span>{Math.round(progressPercentage)}% completado</span>
                                        <span className="text-slate-300">Meta: {formatMoney(dailyGoal, 'USD')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Editor de Meta en línea */}
                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    {isEditingGoal ? (
                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                                            <Input
                                                autoFocus
                                                type="number"
                                                className="h-7 w-28 bg-transparent border-none text-white text-xs focus-visible:ring-0 placeholder:text-slate-600"
                                                value={tempGoal}
                                                onChange={(e) => setTempGoal(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                                                placeholder="Nueva meta"
                                            />
                                            <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-md" onClick={handleSaveGoal}>
                                                <Check className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-red-500/20 hover:text-red-400 rounded-md" onClick={() => setIsEditingGoal(false)}>
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="ghost" size="sm" onClick={() => { setTempGoal(String(dailyGoal)); setIsEditingGoal(true); }} className="hover:bg-white/10 px-3 h-8 text-slate-400 hover:text-white transition-colors rounded-full text-xs">
                                            <Pencil className="h-3 w-3 mr-2" />
                                            Editar Objetivo
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 2. TOP VENDEDORES (Data Backend) */}
                <motion.div variants={item} className="col-span-2 lg:col-span-1">
                    <Card className="h-full shadow-sm border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                        <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-100 dark:border-slate-800/50">
                            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                <Users className="h-3.5 w-3.5" />
                                Ranking
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4">
                            <div className="space-y-5">
                                {(stats.topVendedores || []).slice(0, 3).map((vendedor, i) => (
                                    <div key={vendedor.name} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center justify-center w-7 h-7 rounded-full font-bold text-[10px] ring-2 ring-white dark:ring-slate-900 ${i === 0 ? 'bg-yellow-100 text-yellow-700 shadow-sm' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none truncate max-w-[90px]">{vendedor.name}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{vendedor.count} ops</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                {formatMoney(vendedor.total, 'USD')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {(!stats.topVendedores || stats.topVendedores.length === 0) && (
                                    <div className="text-center py-8 text-xs text-slate-400 italic">Sin datos de vendedores</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 3. ACTIVIDAD RECIENTE (Data Backend) */}
                <motion.div variants={item} className="col-span-2 lg:col-span-1">
                    <Card className="h-full shadow-sm border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                        <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-100 dark:border-slate-800/50">
                            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                <History className="h-3.5 w-3.5" />
                                Últimas Ops
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4">
                            <div className="space-y-4">
                                {(stats.ultimasOperaciones || []).slice(0, 4).map((op) => (
                                    <div key={op.id} className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors -mx-1.5">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-md text-emerald-600 dark:text-emerald-400">
                                                <TrendingUp className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{op.cliente}</p>
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    {new Date(op.fecha).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                            +{formatMoney(op.monto, 'USD')}
                                        </span>
                                    </div>
                                ))}
                                 {(!stats.ultimasOperaciones || stats.ultimasOperaciones.length === 0) && (
                                    <div className="text-center py-8 text-xs text-slate-400 italic">Sin actividad</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 4. SALDOS DE CAJAS (Data Backend - Solo lectura) */}
                <motion.div variants={item} className="col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Cajas ARS */}
                     <Card className="shadow-sm border-l-[3px] border-l-blue-500 bg-white dark:bg-slate-950">
                        <CardContent className="py-4 px-5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cajas ARS</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                    {formatMoney(stats.saldoARS, 'ARS')}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex gap-1">
                                    {Object.entries(stats.billeterasDetalle?.ARS || {}).slice(0, 3).map(([key, val]) => (
                                        val > 0 && <div key={key} className="w-1.5 h-6 bg-blue-100 dark:bg-blue-900 rounded-sm overflow-hidden relative" title={`${key}: ${val}`}>
                                            <div className="absolute bottom-0 w-full bg-blue-500" style={{height: '60%'}}></div>
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] text-slate-400">
                                    {Object.keys(stats.billeterasDetalle?.ARS || {}).length} cuentas
                                </span>
                            </div>
                        </CardContent>
                     </Card>
                     
                     {/* Cajas USD */}
                     <Card className="shadow-sm border-l-[3px] border-l-emerald-500 bg-white dark:bg-slate-950">
                        <CardContent className="py-4 px-5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cajas USD</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                    {formatMoney(stats.saldoUSD, 'USD')}
                                </p>
                            </div>
                             <div className="flex flex-col items-end gap-1">
                                <div className="flex gap-1">
                                    {Object.entries(stats.billeterasDetalle?.USD || {}).slice(0, 3).map(([key, val]) => (
                                        val > 0 && <div key={key} className="w-1.5 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-sm overflow-hidden relative" title={`${key}: ${val}`}>
                                             <div className="absolute bottom-0 w-full bg-emerald-500" style={{height: '75%'}}></div>
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] text-slate-400">
                                    {Object.keys(stats.billeterasDetalle?.USD || {}).length} cuentas
                                </span>
                            </div>
                        </CardContent>
                     </Card>
                </motion.div>

            </div>
        </motion.div>
    )
}