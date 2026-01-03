import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ConfigContextType {
    appName: string;
    updateAppName: (newName: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
    // Leemos del localStorage al iniciar. Si no hay nada, usamos 'ICloud' por defecto.
    const [appName, setAppName] = useState(() => {
        return localStorage.getItem('sys_app_name') || 'ICloud';
    });

    const updateAppName = (newName: string) => {
        setAppName(newName);
        localStorage.setItem('sys_app_name', newName); // Guardamos para que no se pierda
    };

    return (
        <ConfigContext.Provider value={{ appName, updateAppName }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) throw new Error('useConfig debe usarse dentro de ConfigProvider');
    return context;
};