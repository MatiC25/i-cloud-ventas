import React from 'react';
import { AuthProvider } from './components1/Context/AuthContext';
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

const AppLayout: React.FC = () => {
    const { activeTab, setActiveTab } = useNavigation();

    // Calculate Breadcrumb
    const activeGroup = SideBarData.navGroups.find(g => g.items.some(i => i.url === activeTab));
    const activeItem = activeGroup?.items.find(i => i.url === activeTab) || SideBarData.navSecondary.find(i => i.url === activeTab);

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
                        {/* <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="relative cursor-pointer">
                                    <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                                    {pendingCount > 0 && (
                                        <Badge className="absolute -top-2 -right-2 px-1 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] bg-red-500 text-white border-none">
                                            {pendingCount}
                                        </Badge>
                                    )}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="max-h-[300px] overflow-y-auto">
                                    {pendingCount === 0 ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No tienes tareas pendientes.
                                        </div>
                                    ) : (
                                        pendingTasks.slice(0, 5).map((task, i) => (
                                            <DropdownMenuItem key={i} className="p-2 cursor-pointer focus:bg-accent focus:text-accent-foreground" onClick={() => setActiveTab("tasks")}>
                                                <div className="flex flex-col w-full gap-1 p-3 rounded-md bg-secondary/30 border border-border/50 hover:bg-secondary/50 hover:border-blue-500/30 transition-all">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-bold text-sm text-primary">{task.Cliente}</span>
                                                        <span className="text-[10px] font-mono text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded border border-border/50">
                                                            {new Date(task.Fecha_Objetivo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                                                        {task.Descripcion}
                                                    </span>
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </div>
                                <DropdownMenuSeparator />
                                <div className="p-2">
                                    <Button variant="ghost" className="w-full text-xs h-8" onClick={() => setActiveTab("tasks")}>
                                        Ver todas las tareas
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu> */}
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
                    <AuthProvider>
                        <AppContent />
                    </AuthProvider>
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