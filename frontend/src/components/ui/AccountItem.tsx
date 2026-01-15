import { LucideIcon } from 'lucide-react';
import React from 'react';

interface AccountItemProps {
    name: string;
    balance: number;
    currency: string;
    icon: LucideIcon;
    color: string;
}

// ✅ Forma correcta de envolverlo
export const AccountItem = React.memo(({ name, balance, currency, icon: Icon, color }: AccountItemProps) => {
    return (
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
});
