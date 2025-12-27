// src/types.ts

export interface IVenta {
    cliente: {
        nombre: string;
        apellido: string;
        email: string;
        canal: string;     
        contacto: string;  
    };
    producto: {
        tipo: string;          
        modelo: string;
        capacidad: string;     
        color: string;
        estado: string;        
        imei?: string;          
        costo: number;         
    };
    transaccion: {
        cantidad: number;
        monto: number;         
        divisa: string;        
        tipoCambio: number;    
        envioRetiro: string;
        comentarios: string;
    };
    parteDePago: {             
        esParteDePago: boolean; 
        tipo: string;          
        modelo: string;
        capacidad: string;
        costo: number;         
    };
}