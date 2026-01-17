import React, { useMemo } from 'react';
import { ConfigProvider } from './components1/Admin/ConfigContext';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/SideBar";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";
import { ModeToggle } from "@/components/ThemeProvider/ModeToggle";
import { Dashboard } from "@/components/Pages/Dashboard/Dashboard";
import { Estadisticas } from "@/components/Pages/Estadisticas/Estadisticas";
import { UltimasVentas } from "@/components/Pages/Ventas/UltimasVentas";
import { HistorialVentas } from "@/components/Pages/Ventas/HistorialVentas";
import { Toaster } from "@/components/ui/sonner";
import { SystemSettings } from './components1/Admin/SystemSettings';
import { SideBarData } from "@/components/Layout/SideBarData";
import { Bell, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TasksPage } from './components/Pages/Tasks/TasksPage';

import { NavigationProvider, useNavigation } from '@/components/Layout/NavigationContext';
import { AdminPanel } from './components/Pages/AdminPanel/adminPanel';
import { useUser } from "@clerk/clerk-react";

const AppLayout: React.FC = () => {
    const { activeTab, setActiveTab } = useNavigation();
    const { user, isLoaded, isSignedIn } = useUser();


    const filteredSideBarData = useMemo(() => {
        const isAdmin = user?.publicMetadata?.role === "admin";

        return {
            ...SideBarData,
            // Filtramos los grupos principales
            navGroups: SideBarData.navGroups.map(group => ({
                ...group,
                items: group.items.filter(item => {
                    // Si es "admin-panel" (o tiene la flag requiresAdmin), revisamos el rol
                    if (item.url === "admin-panel" || item.requiresAdmin) {
                        return isAdmin;
                    }
                    return true;
                })
            })),
            // Filtramos el menú secundario
            navSecondary: SideBarData.navSecondary.filter(item => {
                if (item.url === "admin-panel" || item.requiresAdmin) {
                    return isAdmin;
                }
                return true;
            })
        };
    }, [user, isLoaded]);

    // Calculate Breadcrumb
    const activeGroup = filteredSideBarData.navGroups.find(g => g.items.some(i => i.url === activeTab));
    const activeItem = activeGroup?.items.find(i => i.url === activeTab) || filteredSideBarData.navSecondary.find(i => i.url === activeTab);

    return (
        <SidebarProvider>
            <AppSidebar onTabChange={setActiveTab} activeTab={activeTab} />

            <main className="w-full bg-background min-h-screen transition-colors duration-300">

                {/* Header */}
                <div className="sticky top-0 z-50 p-4 border-b border-border bg-background flex items-center justify-between gap-4">

                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <div className="flex items-center gap-1 text-sm">
                            {activeGroup && (
                                <>
                                    <span className="text-muted-foreground">{activeGroup.title}</span>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </>
                            )}
                            <span className="font-semibold text-foreground">{activeItem?.title || "Dashboard"}</span>
                        </div>

                    </div>

                    <div className="flex items-center gap-4">
                        <TaskDrawer />
                        <ModeToggle />
                    </div>
                </div>

                {/* Área de contenido */}
                <div className="p-8">
                    {activeTab === "dashboard" && <Dashboard />}
                    {activeTab === "nueva-venta-minimalista" && <NuevaVentaMinimalista />}
                    {activeTab === "tasks" && <TasksPage />}
                    {activeTab === "estadisticas" && <Estadisticas />}
                    {activeTab === "ultimas-ventas" && <UltimasVentas />}
                    {activeTab === "historial" && <HistorialVentas />}
                    {activeTab === "advanced" && <SystemSettings />}
                    {activeTab === "admin-panel" && (user?.publicMetadata.role === "admin" ? <AdminPanel /> : <div>Acceso denegado</div>)}
                </div>

            </main>
            <Toaster />
        </SidebarProvider>
    );
};

const AppContent: React.FC = () => {
    return (
        <NavigationProvider>
            <AppLayout />
        </NavigationProvider>
    )
};

import { ClerkProvider, SignedIn, SignedOut, SignIn, UserButton } from "@clerk/clerk-react";
import { NuevaVentaMinimalista } from './components/Pages/Ventas/DatosMinimalista/NuevaVentaMinimalista';
import { TaskDrawer } from './components/Pages/Tasks/TaskDrawer';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key")
}

const App: React.FC = () => {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ConfigProvider>
                <SignedIn>
                    <AppContent />
                </SignedIn>

                <SignedOut>
                    <div className="flex h-screen w-full items-center justify-center bg-background">
                        <SignIn />
                    </div>
                </SignedOut>
            </ConfigProvider>
        </ThemeProvider>
    );
};

export default App;