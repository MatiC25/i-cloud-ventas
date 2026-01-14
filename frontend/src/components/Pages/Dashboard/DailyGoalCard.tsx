import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Target, Pencil, Check, X } from "lucide-react";
import { format } from "date-fns";
import { IDashboardStats } from "@/types";
import { FireworksBackground } from "@/components/ui/fireworks";

interface DailyGoalCardProps {
    stats: IDashboardStats | null;
}

export function DailyGoalCard({ stats }: DailyGoalCardProps) {
    const [dailyGoal, setDailyGoal] = useState(500000);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState("");

    useEffect(() => {
        const savedGoal = localStorage.getItem("dashboard_daily_goal");
        if (savedGoal) {
            setDailyGoal(Number(savedGoal));
        }
    }, []);

    const handleSaveGoal = () => {
        const val = Number(tempGoal);
        if (!isNaN(val) && val > 0) {
            setDailyGoal(val);
            localStorage.setItem("dashboard_daily_goal", String(val));
            setIsEditingGoal(false);
        }
    };

    // Calculate goal progress based on today's chart data
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    // Ensure stats and chartData exist before accessing
    const todayData = stats?.chartData?.find(d => d.date === todayStr) || { income: 0, profit: 0 };
    // Use income (ingresos) for the goal, consistent with previous logic
    const lastDayVentas = todayData.income || 0;

    // Calculate percentage, capped at 100 for visual bar, but we can show >100% text
    const progressPercentage = Math.min((lastDayVentas / dailyGoal) * 100, 100);
    const goalMet = lastDayVentas >= dailyGoal;

    return (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg overflow-hidden relative group">
            {goalMet && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <FireworksBackground population={40} />
                </div>
            )}
            <div className="absolute right-4 top-4 opacity-10 transition-opacity group-hover:opacity-20">
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
                <div className="text-3xl lg:text-4xl font-bold mb-4">
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
                        <span>{Math.round((lastDayVentas / dailyGoal) * 100)}%</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
