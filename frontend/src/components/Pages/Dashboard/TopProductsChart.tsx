import React from 'react';
import { Pie, PieChart, Label } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { RankingProductos } from '@/types';

interface TopProductsChartProps {
    topProducts: RankingProductos[];
}

export function TopProductsChart({ topProducts }: TopProductsChartProps) {

    // 1. Prepare Chart Data
    // Rename keys to match domain: product & cantidad
    // WRAP COLORS IN hsl() because shadcn vars are space separated values
    const chartData = topProducts.map((product, index) => {
        const margin = product.monto > 0 ? ((product.monto - product.costo) / product.monto) * 100 : 0;
        return {
            product: product.name,
            cantidad: product.cantidad,
            monto: product.monto,
            costo: product.costo,
            margin: margin,
            fill: `hsl(var(--chart-${(index % 5) + 1}))`
        };
    });

    // 2. Prepare Chart Config
    const chartConfig = {
        cantidad: {
            label: "Cantidad",
        },
        ...topProducts.reduce((acc, product, index) => {
            acc[product.name] = {
                label: product.name,
                color: `hsl(var(--chart-${(index % 5) + 1}))`,
            };
            return acc;
        }, {} as Record<string, { label: string; color: string }>)

    } satisfies ChartConfig

    const totalVisitors = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.cantidad, 0)
    }, [chartData])

    return (
        <Card className="flex flex-col bg-white dark:bg-slate-950 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-800 h-full">
            <CardHeader className="items-center pb-0">
                <CardTitle>Top Productos</CardTitle>
                <CardDescription>Distribución por cantidad de ventas</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[350px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-xl min-w-[180px]">
                                            <div className="flex items-center gap-2 mb-2 border-b border-gray-100 dark:border-slate-800 pb-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: data.fill }}
                                                />
                                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{data.product}</span>
                                            </div>
                                            <div className="grid gap-1.5">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500">Cantidad:</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-200">{data.cantidad} u.</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500">Monto:</span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">${data.monto.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500">Costo:</span>
                                                    <span className="font-medium text-gray-400">${data.costo.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-50 dark:border-slate-800">
                                                    <span className="text-gray-500 font-medium">Margen:</span>
                                                    <span className={`font-bold ${data.margin >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                                                        {data.margin.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Pie
                            data={chartData}
                            dataKey="cantidad"
                            nameKey="product"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="product" />}
                            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
