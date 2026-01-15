/**
 * CacheUtil.js
 * Utilitario avanzado para CacheService con soporte para "Chunking".
 * Permite guardar objetos mayores a 100KB fragmentándolos.
 */

/* global CacheService, JSON, console */

const CacheUtil = {
  _nativeCache: CacheService.getScriptCache(),
  _PREFIX: 'ICONNECT_',
  _CHUNK_SIZE: 90000, // 90KB (Seguro por debajo del límite de 100KB)

  /**
   * Recupera un objeto, reensamblando fragmentos si es necesario.
   */
  get: function(key) {
    const fullKey = this._PREFIX + key;
    
    // 1. Intentar obtener el valor maestro
    const cachedValue = this._nativeCache.get(fullKey);
    
    if (!cachedValue) return null;

    try {
      // 2. Verificar si es un puntero de fragmentación (Chunk Master)
      // Un puntero se ve así: "##CHUNKS##|3" (indicando 3 partes)
      if (cachedValue.startsWith("##CHUNKS##|")) {
        const parts = parseInt(cachedValue.split("|")[1]);
        let fullJson = "";

        // 3. Recuperar todas las partes
        const keysToFetch = [];
        for (let i = 0; i < parts; i++) {
          keysToFetch.push(fullKey + "_part_" + i);
        }
        
        const chunksMap = this._nativeCache.getAll(keysToFetch);
        
        // Reensamblar en orden
        for (let i = 0; i < parts; i++) {
          const chunk = chunksMap[fullKey + "_part_" + i];
          if (!chunk) return null; // Si falta una parte, el caché está corrupto
          fullJson += chunk;
        }

        return JSON.parse(fullJson);
      } 
      
      // 4. Si no es fragmentado, es un JSON normal
      return JSON.parse(cachedValue);

    } catch (e) {
      console.error('Error corrupto en caché: ' + key, e);
      this.remove(key); 
      return null;
    }
  },

  /**
   * Guarda un objeto, fragmentándolo si excede el tamaño máximo.
   */
  put: function(key, data, seconds = 900) { // 900s = 15 min
    const fullKey = this._PREFIX + key;
    const jsonString = JSON.stringify(data);
    const size = jsonString.length;

    console.log(`[CacheUtil] Guardando '${key}'. Tamaño: ${(size/1024).toFixed(2)} KB`);

    try {
      // CASO A: Pequeño (Guardado normal)
      if (size < this._CHUNK_SIZE) {
        this._nativeCache.put(fullKey, jsonString, seconds);
        return;
      }

      // CASO B: Grande (Fragmentación)
      const chunks = [];
      let offset = 0;
      
      while (offset < size) {
        chunks.push(jsonString.substring(offset, offset + this._CHUNK_SIZE));
        offset += this._CHUNK_SIZE;
      }

      console.log(`[CacheUtil] Objeto grande. Fragmentado en ${chunks.length} partes.`);

      // Guardar las partes
      const payload = {};
      chunks.forEach((chunk, index) => {
        payload[fullKey + "_part_" + index] = chunk;
      });
      
      // Apps Script permite guardar múltiples claves de una vez (más eficiente)
      this._nativeCache.putAll(payload, seconds);

      // Guardar el puntero maestro
      this._nativeCache.put(fullKey, `##CHUNKS##|${chunks.length}`, seconds);

    } catch (e) {
      console.error('[CacheUtil] Error fatal guardando caché:', e);
    }
  },

  /**
   * Elimina un dato y sus posibles fragmentos.
   */
  remove: function(key) {
    const fullKey = this._PREFIX + key;
    
    // Primero verificamos si era fragmentado para borrar las partes
    const cachedValue = this._nativeCache.get(fullKey);
    if (cachedValue && cachedValue.startsWith("##CHUNKS##|")) {
        const parts = parseInt(cachedValue.split("|")[1]);
        const keysToRemove = [fullKey];
        for (let i = 0; i < parts; i++) {
            keysToRemove.push(fullKey + "_part_" + i);
        }
        this._nativeCache.removeAll(keysToRemove);
    } else {
        this._nativeCache.remove(fullKey);
    }
  }
};