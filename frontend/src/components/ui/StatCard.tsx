import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number;
    subtext?: string;
    color?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, subtext, color }: StatCardProps) => (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl ${color ? `${color} text-white` : 'bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300'}`}>
                <Icon size={20} />
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
