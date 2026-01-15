import React from "react"
import { useForm, FormProvider } from "react-hook-form"
import { NuevaVentaPrueba } from "../Ventas/NuevaVentaPrueba"
import { IFormConfig, IConfigProducto } from "@/types"

/* ===========================
   MOCK: IFormConfig
=========================== */
const mockFormConfig: IFormConfig = {
  metodosPago: [
    "Efectivo",
    "Transferencia",
    "Tarjeta de Débito",
    "Tarjeta de Crédito",
    "USD",
  ],
  divisas: ["ARS", "USD"],
  tiposDeOperaciones: [
    "Venta",
    "Reserva",
    "Seña",
  ],
  tiposDeProductos: [
    "iPhone",
    "Samsung",
    "Xiaomi",
    "Accesorio",
  ],
  modelosDeProductos: [
    "iPhone 13",
    "iPhone 14",
    "iPhone 15",
    "Galaxy S23",
    "Galaxy S24",
  ],
  capacidadesDeProductos: [
    "64GB",
    "128GB",
    "256GB",
    "512GB",
  ],
  coloresDeProductos: [
    "Black",
    "White",
    "Blue",
    "Midnight",
    "Green",
  ],
  canalesDeVenta: [
    "Local",
    "Instagram",
    "WhatsApp",
    "Mercado Libre",
    "Referido",
  ],
  estadosDeProductos: [
    "Nuevo",
    "Usado",
    "Reacondicionado",
  ],
  destinos: [
    "Local",
    "Domicilio",
    "Correo",
  ],
}

/* ===========================
   MOCK: IConfigProducto
=========================== */
const mockProductosConfig: IConfigProducto[] = [
  {
    Categoria: "iPhone",
    Modelo: "iPhone 14",
    Variantes: "128GB,256GB,512GB",
    Colores: "Black,White,Midnight",
  },
  {
    Categoria: "iPhone",
    Modelo: "iPhone 15",
    Variantes: "128GB,256GB",
    Colores: "Blue,Green,Black",
  },
  {
    Categoria: "Samsung",
    Modelo: "Galaxy S24",
    Variantes: "128GB,256GB",
    Colores: "Black,Lavender,Green",
  },
  {
    Categoria: "Accesorio",
    Modelo: "Cargador USB-C",
    Variantes: "20W,30W",
    Colores: "White,Black",
  },
]

/* ===========================
   MOCK: loading
=========================== */
const mockLoading = false

/* ===========================
   DEFAULT VALUES DEL FORM
=========================== */
const defaultValues = {
  cliente: {
    nombre: "",
    apellido: "",
    email: "",
    contacto: "",
    canal: "",
  },
  productos: [
    {
      tipo: "",
      modelo: "",
      capacidad: "",
      color: "",
      estado: "Nuevo",
      costo: 0,
      precio: 0,
      cantidad: 1,
      imei: "",
    },
  ],
  pagos: [],
  transaccion: {
    envioRetiro: "Retiro",
    descargarComprobante: true,
    comentarios: "",
  },
}

/* ===========================
   COMPONENTE MOCK
=========================== */
export default function Estadisticas() {
  const methods = useForm({
    defaultValues,
    mode: "onChange",
  })

  const onSubmit = (data: any) => {
    console.log("DATA ENVIADA:", data)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <NuevaVentaPrueba
          formConfig={mockFormConfig}
          productosConfig={mockProductosConfig}
          loading={mockLoading}
        />
      </form>
    </FormProvider>
  )
}
