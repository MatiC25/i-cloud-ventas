# Estado del Proyecto: GoogleApp

**Fecha de Generación:** 2026-01-10
**Versión del Documento:** 1.1

## 1. Resumen Ejecutivo
La aplicación es un sistema de gestión de ventas e inventario diseñado para operar en un entorno serverless utilizando el ecosistema de Google. El frontend es una SPA (Single Page Application) moderna construida con React que se comunica con un backend hosteado en Google Apps Script. La persistencia de datos se realiza íntegramente en Google Sheets.

Recientemente se ha integrado autenticación robusta mediante **Clerk**, un historial de ventas avanzado con filtros y búsquedas, y se ha modernizado la interfaz utilizando **Shadcn UI**.

## 2. Stack Tecnológico

### Frontend
- **Framework:** React 19 (vía Vite 6.0.0)
- **Lenguaje:** TypeScript 5.9
- **Estilos:** Tailwind CSS 3.4
- **Componentes:** Shadcn UI (Radix Primitives)
- **Autenticación:** Clerk
- **Tablas/Datos:** TanStack Table (React Table v8)
- **Notificaciones:** Sonner
- **Routing:** Navegación por estados/tabs en `App.tsx` (Sidebar Layout)
- **HTTP Client:** Fetch API (encapsulado en `api-back.ts`)
- **Build/Deploy:** GitHub Pages (`gh-pages`)

### Backend & Infraestructura
- **Runtime:** Google Apps Script (V8 Runtime)
- **Lenguaje:** JavaScript (ES6+)
- **Base de Datos:** Google Sheets
- **Herramientas GAS:** CLASP para gestión local.

## 3. Arquitectura del Proyecto

### Estructura de Directorios Clave

#### `frontend/src`
- **`/components`**:
    - `Pages/Ventas/`: Lógica core (`NuevaVenta`, `HistorialVentas`).
    - `Pages/Estadisticas/`: Dashboards.
    - `Layout/`: Sidebar y estructura base.
    - `ui/`: Componentes reutilizables de Shadcn.
- **`/services`**: 
    - `api-back.ts`: Cliente API principal (usa `api-template.ts`).
    - `api.ts`: Legacy (candidato a deprecación).
- **`/utils`**: Generadores PDF y helpers.

#### `backend-icloud/src`
El backend implementa un patrón **Controller-Service-Repository**:
- **`/controller`**: Punto de entrada (`Controller.js`).
- **`/service`**: Lógica de negocio.
- **`/repository`**: Acceso a Sheets.

## 4. Funcionalidades Implementadas

### Backend (Endpoints/Actions)
El backend Web App despacha acciones vía parámetro `action`:
- `nueva_venta`: Registro completo (soporta array de pagos y auditoría).
- `getVentas`: Historial paginado o limitado (reemplaza a `getLastSales`).
- `getConfig`: Recuperación de configuración de productos.
- `check_integrity`: Verificación de Schema en Sheets.
- `addProduct`: Alta de configuraciones.
- `updateConfig`: Actualización de metadata.

### Frontend (Features)
- **Autenticación & Seguridad:** 
    - Integración completa con **Clerk** (Login, Logout, User Profile).
    - Auditoría: Se envía el usuario logueado en cada transacción.
- **Nueva Venta (Wizard/Form):**
    - Validación robusta con Zod + React Hook Form.
    - Soporte multi-pago (Efectivo, Transferencia, etc. combinados).
    - Responsive Design optimizado para Tablets y Notebooks.
    - Feedback visual con Toasts (Sonner).
- **Historial de Ventas:**
    - Tabla avanzada (TanStack Table).
    - Filtros por fecha (Hoy, Semana, Mes).
    - Búsqueda global y por columnas.
    - Paginación y control de visibilidad de columnas.
- **Generación de PDF:** Comprobantes de venta cliente-side.

## 5. Deuda Técnica y Pendientes

### Backend
- **Gestión de Stock:** La lógica de descuento de stock real aún está en desarrollo/verificación.
- **Hardcoding:** Revisar dependencias de índices fijos de columnas en los repositorios viejos.

### Frontend
- **Consolidación de API:** Eliminar `api.ts` y migrar todo a `api-back.ts`.
- **Tipado:** Refinar algunos tipos `any` residuales en componentes viejos.

---
