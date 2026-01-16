
const CACHE_KEY = 'DASHBOARD_STATS';
const CACHE_DURATION = 900;
const STATS_CACHE_KEY = 'DASHBOARD_KPI_V2';

class DashboardService {


    /**
     * Calculates detailed balances by account/method.
     * @param {Array} movimientos - Array of transactions.
     * @returns {Object} breakdown by currency and account.
     */
    static calculateBalancesDetailed(movimientos) {
        const balances = {
            ARS: {},
            USD: {}
        };

        movimientos.forEach(op => {
            let divisa = (op.divisa || "USD").toUpperCase();
            if (divisa === "PESOS") divisa = "ARS";

            const monto = Number(op.monto) || 0;
            const cuenta = op.cuenta || "Caja"; // "Metodo de Pago" or "Destino"
            const tipo = op.tipo || "";

            let multiplier = 0;

            // SUMAN (Entra dinero a la cuenta)
            if (["Ingreso", "Venta", "Relevo Inicial", "Cancelación Deuda", "Cobro"].includes(tipo)) {
                multiplier = 1;
            }
            // RESTAN (Sale dinero de la cuenta)
            else if (["Egreso", "Gasto", "Inversión Publicitaria", "Pago Eluter", "Devolución", "Compra Stock"].includes(tipo)) {
                multiplier = -1;
            }

            if (multiplier !== 0) {
                if (!balances[divisa]) balances[divisa] = {};
                if (!balances[divisa][cuenta]) balances[divisa][cuenta] = 0;

                balances[divisa][cuenta] += monto * multiplier;
            }
        });

        return balances;
    }

    /**
     * Refreshes the dashboard cache sheet.
    */
    static actualizarCacheDashboard() {
        const ss = getDB();
        let cacheSheet = ss.getSheetByName("Dashboard_Cache");

        if (!cacheSheet) {
            cacheSheet = ss.insertSheet("Dashboard_Cache");
            cacheSheet.appendRow([
                "Profit Mes", "Gastos Mes", "Saldo ARS", "Saldo USD",
                "JSON_Grafico", "Ultima Act", "Meta Ads Mes", "JSON_Gastos_Pie",
                "JSON_Ventas_Categoria", "JSON_Top_Productos", "JSON_Metodos_Pago",
                "Total_Ordenes", "Ordenes_Tendencia", "JSON_Billeteras_Detalle", "JSON_Recientes"
            ]);
            cacheSheet.getRange("A1:O1").setFontWeight("bold");
        }

        // 1. Get All Data
        const ventasRepo = new VentaRepository();
        const ventas = ventasRepo.findAll();

        const gastosSheet = ss.getSheetByName("Libro Diario");
        let gastos = [];
        if (gastosSheet && gastosSheet.getLastRow() > 1) {
            const gData = gastosSheet.getDataRange().getValues();
            const gHeaders = GastosMapper.getHeadersPrincipal();
            gastos = gData.slice(1).map(r => {
                let obj = {};
                gHeaders.forEach((h, i) => obj[h] = r[i]);
                return obj;
            });
        }

        // 2. Stats Calculation
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let profitMensual = 0;
        let gastosMensuales = 0;
        let metaAdsSpendMonth = 0;
        const expensesBreakdown = {};
        const dailyStats = {};

        const getDayKey = (d) => Utilities.formatDate(new Date(d), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");

        // --- SALES PROCESSING ---
        ventas.forEach(v => {
            const vDate = new Date(v["Fecha"]);
            const vMonto = Number(v["Total en Dolares"] || v["Monto"]) || 0;
            const vProfit = Number(v["Profit Bruto"] || v["Profit"]) || 0;

            if (vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear) {
                profitMensual += vProfit;
            }

            const key = getDayKey(vDate);
            if (!dailyStats[key]) dailyStats[key] = { income: 0, expense: 0, profit: 0, date: key };
            dailyStats[key].income += vMonto;
            dailyStats[key].profit += vProfit;
        });

        // --- EXPENSES PROCESSING ---
        const normalizedGastos = gastos.map(g => ({
            tipo: g["Tipo de Movimiento"],
            categoria: g["Categoría de Movimiento"] || "General",
            divisa: g["Divisa"],
            monto: Number(g["Monto"]),
            fecha: new Date(g["Fecha"]),
            destino: g["Destino"] // Account equivalent
        }));

        normalizedGastos.forEach(g => {
            if (["Egreso", "Gasto", "Inversión Publicitaria", "Pago Eluter", "Compra Stock"].includes(g.tipo)) {
                if (g.fecha.getMonth() === currentMonth && g.fecha.getFullYear() === currentYear) {
                    if (g.divisa === 'USD') {
                        gastosMensuales += g.monto;
                        if (g.tipo === "Inversión Publicitaria" || g.categoria === "Marketing") {
                            metaAdsSpendMonth += g.monto;
                        }
                        const catKey = g.tipo === "Inversión Publicitaria" ? "Publicidad" : (g.tipo === "Compra Stock" ? "Stock" : "Otros");
                        expensesBreakdown[catKey] = (expensesBreakdown[catKey] || 0) + g.monto;
                    }
                }
                const key = getDayKey(g.fecha);
                if (!dailyStats[key]) dailyStats[key] = { income: 0, expense: 0, profit: 0, date: key };
                if (g.divisa === 'USD') {
                    dailyStats[key].expense += g.monto;
                }
            }
        });

        // 3. GET LIVE BALANCES
        const { saldoARS, saldoUSD, billeterasDetalle } = DashboardService.getLiveBalances();


        // 4. CHART DATA (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const chartData = Object.values(dailyStats)
            .filter(d => new Date(d.date) >= thirtyDaysAgo)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // 5. METRICS 
        const pieChartData = Object.keys(expensesBreakdown).map(key => ({ name: key, value: expensesBreakdown[key] }));

        // 5a. Sales by Category
        const salesByCategory = {};
        ventas.forEach(v => {
            const vDate = new Date(v["Fecha"]);
            if (vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear) {
                const categoria = v["Equipo | Producto"] || "General";
                // Simple categorization fallback logic if needed
                const catName = categoria.split(" ")[0]; // Take first word e.g. "iPhone" from "iPhone 13"
                salesByCategory[catName] = (salesByCategory[catName] || 0) + (Number(v["Total en Dolares"] || v["Monto"]) || 0);
            }
        });
        // Transform to array for Recharts { name, value, color }
        // We'll add colors in frontend or here.
        const salesByCategoryArray = Object.keys(salesByCategory)
            .map(cat => ({ name: cat, value: salesByCategory[cat] })) // Value is money for now. Or count? User asked for % mix.
            // Let's recalculate as share of total
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const totalSalesMonth = salesByCategoryArray.reduce((acc, curr) => acc + curr.value, 0);

        const mixVentas = salesByCategoryArray.map(item => ({
            name: item.name,
            value: totalSalesMonth > 0 ? Number(((item.value / totalSalesMonth) * 100).toFixed(1)) : 0
        }));


        // 5b. Top Products
        const productSales = {};
        ventas.forEach(v => {
            const vDate = new Date(v["Fecha"]);
            if (vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear) {
                const producto = `${v["Equipo | Producto"] || ''} ${v["Modelo"] || ''}`.trim() || "Varios";
                const profit = Number(v["Profit Bruto"] || v["Profit"]) || 0;

                if (!productSales[producto]) productSales[producto] = { sales: 0, profit: 0 };
                productSales[producto].sales += 1; // Count units
                productSales[producto].profit += profit;
            }
        });
        const topProducts = Object.keys(productSales)
            .map(prod => ({
                name: prod,
                sales: productSales[prod].sales,
                profit: productSales[prod].profit
            }))
            .sort((a, b) => b.profit - a.profit) // Sort by Profit as per design
            .slice(0, 5);


        // 5c. Recent Activity
        const recentActivity = [];
        // Last 10 Sales
        ventas.slice(-10).forEach(v => {
            recentActivity.push({
                id: v["N° ID"],
                fecha: v["Fecha"],
                cliente: v["Nombre y Apellido"],
                monto: Number(v["Total en Dolares"] || v["Monto"]),
                divisa: "USD",
                tipo: "Venta"
            });
        });
        // Last 10 Expenses
        gastos.slice(-10).forEach(g => {
            recentActivity.push({
                id: g["ID"] || "EXP",
                fecha: g["Fecha"],
                cliente: g["Detalle"] || "Gasto",
                monto: Number(g["Monto"]),
                divisa: g["Divisa"],
                tipo: "Gasto"
            });
        });
        // Sort and slice
        const sortedActivity = recentActivity
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 10);


        // 5d. Total Orders
        const totalOrders = ventas.filter(v => {
            const d = new Date(v["Fecha"]);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        // Trend logic
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const prevOrders = ventas.filter(v => {
            const d = new Date(v["Fecha"]);
            return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        }).length;
        const trend = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;


        // 6. CACHE WRITE
        const rowData = [
            profitMensual,
            gastosMensuales,
            saldoARS,
            saldoUSD,
            JSON.stringify(chartData),
            new Date(),
            metaAdsSpendMonth,
            JSON.stringify(pieChartData),
            JSON.stringify(mixVentas),
            JSON.stringify(topProducts),
            "[]", // unused payment methods legacy slot
            totalOrders,
            trend,
            JSON.stringify(billeterasDetalle), // New Col N
            JSON.stringify(sortedActivity)    // New Col O
        ];

        // Ensure headers exist
        const currentHeaders = cacheSheet.getRange(1, 1, 1, cacheSheet.getLastColumn()).getValues()[0];
        if (currentHeaders.length < 15) {
            cacheSheet.getRange(1, 14, 1, 2).setValues([["JSON_Billeteras_Detalle", "JSON_Recientes"]]);
            cacheSheet.getRange("A1:O1").setFontWeight("bold");
        }

        cacheSheet.getRange(2, 1, 1, rowData.length).setValues([rowData]);

        return { status: "cached", timestamp: new Date() };
    }

    static getStats() {
        const ss = getDB();
        const cacheSheet = ss.getSheetByName("Dashboard_Cache");

        if (!cacheSheet || cacheSheet.getLastRow() < 2) {
            DashboardService.actualizarCacheDashboard();
            return DashboardService.getStats();
        }

        const lastCol = cacheSheet.getLastColumn();
        const data = cacheSheet.getRange(2, 1, 1, Math.max(lastCol, 15)).getValues()[0];

        // Safe JSON Parse
        const parseJ = (jsonStr, defaultVal = []) => {
            try { return jsonStr ? JSON.parse(jsonStr) : defaultVal; }
            catch (e) { return defaultVal; }
        };

        // FETCH LIVE BALANCES TO OVERRIDE CACHE
        const { saldoARS, saldoUSD, billeterasDetalle } = DashboardService.getLiveBalances();

        return {
            profitMensual: Number(data[0]),
            gastosMensuales: Number(data[1]),
            saldoARS: saldoARS, // Live
            saldoUSD: saldoUSD, // Live
            chartData: parseJ(data[4]),
            lastUpdate: data[5],
            metaAdsSpend: Number(data[6]) || 0,
            expensesPie: parseJ(data[7]),
            categorias: parseJ(data[8]),
            topProductos: parseJ(data[9]),
            // data[10] unused
            totalOrdenes: Number(data[11]) || 0,
            tendenciaProfit: Number(data[12]) || 0,

            billeterasDetalle: billeterasDetalle, // Live
            recientes: parseJ(data[14])
        };
    }

    /**
     * Lee la hoja de "Cajas"
    */
    static getLiveBalances() {
        const cajasRepo = new _GenericRepository("Cajas");
        const cajasData = cajasRepo.findAll();

        const balancesDetailed = {
            ARS: {},
            USD: {}
        };

        cajasData.forEach(caja => {
            const name = caja["Cajas"];
            const saldoArg = Number(caja["Actualidad ARS"]) || 0;
            const saldoUsd = Number(caja["Actualidad USD"]) || 0;

            if (name) {
                if (saldoArg !== 0) balancesDetailed.ARS[name] = saldoArg;
                if (saldoUsd !== 0) balancesDetailed.USD[name] = saldoUsd;
            }
        });

        const saldoARS = Object.values(balancesDetailed.ARS).reduce((a, b) => a + b, 0);
        const saldoUSD = Object.values(balancesDetailed.USD).reduce((a, b) => a + b, 0);

        return {
            saldoARS,
            saldoUSD,
            billeterasDetalle: balancesDetailed
        };
    }

    static getVentasStats() {
        const ventaRepo = new _GenericRepository("Clientes Minoristas");
        const ventaRepoMayorista = new _GenericRepository("Clientes Mayoristas");

        const ventasDataMinorista = ventaRepo.findAll();
        const ventasDataMayorista = ventaRepoMayorista.findAll();

        const ventas = ventasDataMinorista.concat(ventasDataMayorista);


        const ventasStats = this._processMetrics(ventas);

        return ventasStats;
    }

    /**
     * Invalida la cache
    */
    static invalidateCache(CacheKey) {
        CacheUtil.remove(CacheKey);
    }

    static _processMetrics(ventas) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

        const buckets = {
            hoy: { total: 0, count: 0, profit: 0 },
            mes: { total: 0, count: 0, profit: 0 },
            anio: { total: 0, count: 0, profit: 0 },
            historico: { total: 0, count: 0, profit: 0 }
        };

        const vendedoresMap = {};

        ventas.forEach(venta => {
            const fecha = new Date(venta["Fecha"]).getTime();
            const vendedor = venta["Auditoría"];
            const total = Number(venta["Monto"]) || 0;
            const profit = Number(venta["Profit Bruto"]) || 0;

            buckets.historico.total += total;
            buckets.historico.count += 1;
            buckets.historico.profit += profit;

            if (fecha >= startOfDay) {
                buckets.hoy.total += total;
                buckets.hoy.count += 1;
                buckets.hoy.profit += profit;
            }

            if (fecha >= startOfMonth) {
                buckets.mes.total += total;
                buckets.mes.count += 1;
                buckets.mes.profit += profit;
            }

            if (fecha >= startOfYear) {
                buckets.anio.total += total;
                buckets.anio.count += 1;
                buckets.anio.profit += profit;
            }

            if (!vendedoresMap[vendedor]) {
                vendedoresMap[vendedor] = { total: 0, count: 0, profit: 0 };
            }

            vendedoresMap[vendedor].total += total;
            vendedoresMap[vendedor].count++;
            vendedoresMap[vendedor].profit += profit;

        });

        const rankingVendedores = Object.entries(vendedoresMap)
            .map(([nombre, estadisticas]) => ({
                name: nombre,
                ...estadisticas
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        const ultimasOperaciones = [...ventas]
            .sort((a, b) => new Date(b["Fecha"]) - new Date(a["Fecha"]))
            .slice(0, 10)
            .map(v => ({
                id: v.id || v.ID,
                fecha: v.fecha || v.Fecha,
                cliente: v["Nombre y Apellido"] || "",
                tipoProducto: v["Equipo | Producto"] || "",
                modelo: v["Modelo"] || "",
                capacidad: v["Tamaño"] || "",
                color: v["Color"] || "",
                monto: v.monto || v.Monto,
                auditoria: v.auditoria || v.Auditoría || "N/A",
                tipo: "Venta", // Explicitly tag as Venta for the frontend table badge
                divisa: v.divisa || v.Divisa || "USD"  // Assuming sales are USD based on "Total en Dolares"
            }));

        const productosMasVendidos = ventas
            .map(v => v["Equipo | Producto"])
            .filter(Boolean)
            .reduce((acc, producto) => {
                acc[producto] = (acc[producto] || 0) + 1;
                return acc;
            }, {});

        const rankingProductos = Object.entries(productosMasVendidos)
            .map(([producto, cantidad]) => ({
                name: producto,
                cantidad,
                costo: Number(ventas.find(v => v["Equipo | Producto"] === producto)["Costo del Producto"]) || 0,
                monto: Number(ventas.find(v => v["Equipo | Producto"] === producto)["Monto"]) || 0
            }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5);

        return {
            stats: buckets,
            topVendedores: rankingVendedores,
            ultimasOperaciones: ultimasOperaciones,
            rankingProductos: rankingProductos,
            ultimaModificacion: new Date().toISOString()
        };
    }

    /**
     * Obtiene los datos del dashboard
    */
    static getDashboardStats() {
        const cachedStats = CacheUtil.get(this.STATS_CACHE_KEY);
        if (cachedStats != null) {
            return {
                source: "cache",
                data: cachedStats
            }
        }

        console.log("🐢 [StatisticsService] Cache MISS. Calculando desde cero...");
        const rawData = DashboardService.getLiveBalances();
        const ventasStats = DashboardService.getVentasStats();

        const dashboardStats = {
            ...rawData,
            ...ventasStats
        };

        CacheUtil.put(this.STATS_CACHE_KEY, dashboardStats, CACHE_DURATION);

        return {
            source: "rebuild",
            data: dashboardStats
        };
    }


    // PRUEBAS // 

    static getDashboardStatsCached() {
        const tStart = Date.now();

        // 1️⃣ Intentar leer cache
        const cached = CacheUtil.get(STATS_CACHE_KEY);
        if (cached !== null) {
            return {
                source: "cache",
                timings: {
                    totalMs: Date.now() - tStart
                },
                data: cached
            };
        }

        // 2️⃣ Cache MISS → recalcular
        const tCalcStart = Date.now();
        const stats = DashboardService._buildDashboardStats();
        const tCalcEnd = Date.now();

        // 3️⃣ Guardar cache
        CacheUtil.put(STATS_CACHE_KEY, stats, CACHE_DURATION);

        return {
            source: "rebuild",
            timings: {
                calcMs: tCalcEnd - tCalcStart,
                totalMs: Date.now() - tStart
            },
            data: stats
        };
    }

    static getDashboardStatsNoCache() {
        const tStart = Date.now();

        const tCalcStart = Date.now();
        const stats = DashboardService._buildDashboardStats();
        const tCalcEnd = Date.now();

        return {
            source: "no-cache",
            timings: {
                calcMs: tCalcEnd - tCalcStart,
                totalMs: Date.now() - tStart
            },
            data: stats
        };
    }

    static _buildDashboardStats() {
        const rawData = DashboardService.getLiveBalances();
        const ventasStats = DashboardService.getVentasStats();

        return {
            ...rawData,
            ...ventasStats
        };
    }

    static triggerCacheRebuild(category) {

        if(category === "all" || category === "dashboard") {
            this.invalidateCache(this.STATS_CACHE_KEY);
        }

        const stats = this._buildDashboardStats();

        CacheUtil.put(this.STATS_CACHE_KEY, stats, CACHE_DURATION);

        return {
            success: true,
            category: category,
            rebuilt: true,
            data: stats
        };
    }


}
