const CACHE_DURATION = 180;
const AGREGADOR_CACHE_KEY = 'AGREGADOR_DATA';

class AgregadorService {

    static findAll(sheetName, limit = 100) {
        const repo = new _GenericRepository(sheetName);
        return repo.findAllWith(limit);
    }

    static getRecentOperations(limit = 50) {
        // Si el limit es 0, traemos TODO (o un numero muy grande)
        const effectiveLimit = (limit === 0) ? 5000 : limit;

        // Cache Key distinta si pedimos todo vs pedimos 50
        const CACHE_KEY = (limit === 0) ? AGREGADOR_CACHE_KEY + "_FULL" : AGREGADOR_CACHE_KEY;

        const cachedData = CacheUtil.get(CACHE_KEY);
        if (cachedData) {
            return cachedData;
        }

        const minorista = this.findAll(SHEET.CLIENTES_MINORISTAS, effectiveLimit);
        const mayorista = this.findAll(SHEET.CLIENTES_MAYORISTAS, effectiveLimit);
        const gasto = this.findAll(SHEET.GASTOS, effectiveLimit);

        const result = {
            "Minorista": [...minorista],
            "Mayorista": [...mayorista],
            "Gasto": [...gasto]
        }

        CacheUtil.put(CACHE_KEY, result, CACHE_DURATION);
        return result;
    }



    static invalidateCache() {
        CacheUtil.remove(AGREGADOR_CACHE_KEY);
    }

    static getRecentOperationsSorted(limit = 50) {
        const minorista = this.findAll(SHEET.CLIENTES_MINORISTAS, limit);
        const mayorista = this.findAll(SHEET.CLIENTES_MAYORISTAS, limit);
        const gasto = this.findAll(SHEET.GASTOS, limit);

        return {
            "Minorista": [...minorista].sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha)),
            "Mayorista": [...mayorista].sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha)),
            "Gasto": [...gasto].sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha))
        }
    }

}