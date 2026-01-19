import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, LucideIcon, Calendar, CalendarDays, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricsBucket } from '@/types';

interface TimeRangeData {
    hoy?: MetricsBucket;
    mes?: MetricsBucket;
    anio?: MetricsBucket;
}

interface ExpandableStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number;
    subtext?: string;
    color?: string;
    timeRangeData?: TimeRangeData;
    formatValue?: (value: number) => string;
}

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

export const ExpandableStatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    subtext,
    color,
    timeRangeData,
    formatValue = formatCurrency
}: ExpandableStatCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const hasExpandableData = timeRangeData && (timeRangeData.hoy || timeRangeData.mes || timeRangeData.anio);

    return (
        <motion.div
            layout
            className={`bg-white dark:bg-slate-950 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-shadow duration-300 ${hasExpandableData ? 'cursor-pointer hover:shadow-md' : ''}`}
            onClick={() => hasExpandableData && setIsExpanded(!isExpanded)}
        >
            {/* Header - Always visible */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl ${color ? `${color} text-white` : 'bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300'}`}>
                        <Icon size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                        {trend !== undefined && (
                            <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                                {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                {Math.abs(trend)}%
                            </span>
                        )}
                        {hasExpandableData && (
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-gray-400"
                            >
                                <ChevronDown size={18} />
                            </motion.div>
                        )}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                    <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{value}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{subtext}</p>
                </div>
            </div>

            {/* Expandable Content */}
            <AnimatePresence>
                {isExpanded && hasExpandableData && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-slate-800">
                            <div className="space-y-4">
                                {/* Hoy */}
                                {timeRangeData.hoy && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Hoy</p>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-semibold">{formatValue(timeRangeData.hoy.total)}</span>
                                                    <span className="text-gray-400 ml-1">total</span>
                                                </span>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-semibold">{timeRangeData.hoy.count}</span>
                                                    <span className="text-gray-400 ml-1">ventas</span>
                                                </span>
                                                <span className="text-sm text-green-600 dark:text-green-400">
                                                    <span className="font-semibold">{formatValue(timeRangeData.hoy.profit)}</span>
                                                    <span className="text-green-500/70 ml-1">profit</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mes */}
                                {timeRangeData.mes && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-900/10">
                                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                            <CalendarDays size={16} className="text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">Este Mes</p>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-semibold">{formatValue(timeRangeData.mes.total)}</span>
                                                    <span className="text-gray-400 ml-1">total</span>
                                                </span>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-semibold">{timeRangeData.mes.count}</span>
                                                    <span className="text-gray-400 ml-1">ventas</span>
                                                </span>
                                                <span className="text-sm text-green-600 dark:text-green-400">
                                                    <span className="font-semibold">{formatValue(timeRangeData.mes.profit)}</span>
                                                    <span className="text-green-500/70 ml-1">profit</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Año */}
                                {timeRangeData.anio && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10">
                                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                            <TrendingUp size={16} className="text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Este Año</p>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-semibold">{formatValue(timeRangeData.anio.total)}</span>
                                                    <span className="text-gray-400 ml-1">total</span>
                                                </span>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    <span className="font-semibold">{timeRangeData.anio.count}</span>
                                                    <span className="text-gray-400 ml-1">ventas</span>
                                                </span>
                                                <span className="text-sm text-green-600 dark:text-green-400">
                                                    <span className="font-semibold">{formatValue(timeRangeData.anio.profit)}</span>
                                                    <span className="text-green-500/70 ml-1">profit</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
