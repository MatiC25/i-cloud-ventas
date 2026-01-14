# Roadmap de Desarrollo

Este documento detalla las próximas funcionalidades y mejoras planificadas para el sistema, organizadas por áreas de impacto.

## Core del Negocio (Funcionalidad Crítica)

- [ ] **Support Multi-producto por Venta**
    - Permitir cargar varios ítems en una sola operación.
    - *Impacto técnico: Refactorizar la estructura de guardado para que refleje múltiples líneas (o ítems) bajo un mismo ID de operación.*

- [ ] **Segmentación de Clientes (Mayoristas vs. Minoristas)**
    - Distinguir tipos de cliente (flag/booleano) y lógica de precios diferenciada.
    - *Estrategia de datos: Evaluar si conviene separar en "hojas distintas" (más fácil visualmente) o mantener una sola base con una columna "Tipo" (más escalable para reportes).*

## Módulo de Administración y Edición (CRUD)

- [ ] **Buscador y Edición Avanzada**
    - Buscador integrado que permita localizar una venta y modificar datos sensibles post-operación (tipo de cambio, método de pago, etc.).

- [ ] **Rediseño de Reportes (PDF)**
    - Actualizar el formato del comprobante de venta (jspdf) para reflejar la nueva estética o datos requeridos por el cliente.

## Auditoría y Seguridad

- [ ] **Trazabilidad de Operaciones**
    - Registrar automáticamente quién (usuario logueado) creó o modificó cada venta.

- [ ] **Filtros de Auditoría**
    - Buscador que permita filtrar el historial de ventas por "Responsable" para control interno.

## Business Intelligence (BI) y Finanzas

- [ ] **Métrica de Profit Diario**
    - Cálculo automático de ganancia neta por día (Ventas - Costos).

- [ ] **Dashboard de Gastos**
    - Nueva sección o vista gráfica para visualizar egresos y flujo de caja, separado de las ventas.

## Infraestructura

- [ ] **Despliegue (Deployment)**
    - Configuración y optimización del flujo de despliegue para los diversos entornos (Frontend en GitHub Pages, Backend en Apps Script).
    - *Pendiente: Definir estrategia de versionado y automatización.*
