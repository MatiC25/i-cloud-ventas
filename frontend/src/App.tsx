import React, { useMemo } from 'react';
import { BrowserRouter, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { ConfigProvider } from './components1/Admin/ConfigContext';

// --- TUS IMPORTS DE UI (Sidebar, Themes, etc.) ---
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/SideBar";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";
import { ModeToggle } from "@/components/ThemeProvider/ModeToggle";
import { DashboardV2 } from "@/components/Pages/Dashboard/DashboardV2";
import { Estadisticas } from "@/components/Pages/Estadisticas/Estadisticas";
import { UltimasVentas } from "@/components/Pages/Ventas/UltimasVentas";
import { HistorialVentas } from "@/components/Pages/Ventas/HistorialVentas";
import { HistorialCompleto } from "@/components/Pages/Historial/HistorialCompleto";
import { Toaster } from "@/components/ui/sonner";
import { SystemSettings } from './components1/Admin/SystemSettings';
import { SideBarData } from "@/components/Layout/SideBarData";
import { ChevronRight, Loader2 } from "lucide-react"; // Importamos Loader2
import { TasksPage } from './components/Pages/Tasks/TasksPage';
import { AdminPanel } from './components/Pages/AdminPanel/AdminPanel';
import { Configuracion } from './components/Pages/Configuracion/Configuracion';

import { NavigationProvider, useNavigation } from '@/components/Layout/NavigationContext';
import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut, 
  SignIn, 
  SignUp, 
  RedirectToSignIn, // <--- IMPORTANTE: Usaremos esto
  useUser,
  ClerkLoaded,     // <--- Para saber cuando terminó de cargar Clerk
  ClerkLoading     // <--- Para mostrar spinner mientras carga
} from "@clerk/clerk-react";

import { NuevaVentaMinimalista } from './components/Pages/Ventas/DatosMinimalista/NuevaVentaMinimalista';
import { TaskDrawer } from './components/Pages/Tasks/TaskDrawer';

// --- 1. COMPONENTE APP LAYOUT (Lógica del Dashboard) ---
const AppLayout: React.FC = () => {
    const { activeTab, setActiveTab } = useNavigation();
    const { user, isLoaded } = useUser();

    // Memorizamos la data del sidebar para filtrar por rol
    const filteredSideBarData = useMemo(() => {
        if (!isLoaded || !user) return SideBarData; // Retorno seguro si no ha cargado

        const isAdmin = user?.publicMetadata?.role === "admin";
        return {
            ...SideBarData,
            navGroups: SideBarData.navGroups.map(group => ({
                ...group,
                items: group.items.filter(item => {
                    if (item.url === "admin-panel" || item.requiresAdmin) return isAdmin;
                    return true;
                })
            })),
            navSecondary: SideBarData.navSecondary.filter(item => {
                if (item.url === "admin-panel" || item.requiresAdmin) return isAdmin;
                return true;
            })
        };
    }, [user, isLoaded]);

    // Breadcrumb calculation
    const activeGroup = filteredSideBarData.navGroups.find(g => g.items.some(i => i.url === activeTab));
    const activeItem = activeGroup?.items.find(i => i.url === activeTab) || filteredSideBarData.navSecondary.find(i => i.url === activeTab);

    return (
        <SidebarProvider>
            <AppSidebar onTabChange={setActiveTab} activeTab={activeTab} data={filteredSideBarData} />
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

                {/* Contenido */}
                <div className="p-8">
                    {activeTab === "nueva-venta-minimalista" && <NuevaVentaMinimalista />}
                    {activeTab === "tasks" && <TasksPage />}
                    {activeTab === "estadisticas" && <Estadisticas />}
                    {activeTab === "ultimas-ventas" && <UltimasVentas />}
                    {activeTab === "historial" && <HistorialVentas />}
                    {activeTab === "historial-completo" && <HistorialCompleto />}
                    {activeTab === "advanced" && <SystemSettings />}
                    {activeTab === "admin-panel" && (user?.publicMetadata.role === "admin" ? <AdminPanel /> : <div>Acceso denegado</div>)}
                    {activeTab === "dashboard-V2" && <DashboardV2 />}
                    {activeTab === "configuracion-v2" && <Configuracion />}
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

// --- 2. CONFIGURACIÓN DE CLERK Y RUTAS ---
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key")
}

const ClerkProviderWithRoutes = () => {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ConfigProvider>
            
            {/* SPINNER DE CARGA: Se muestra mientras Clerk averigua si estás logueado */}
            <ClerkLoading>
                <div className="flex h-screen w-full items-center justify-center bg-background">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                </div>
            </ClerkLoading>

            {/* CONTENIDO: Solo carga cuando Clerk está listo */}
            <ClerkLoaded>
              <Routes>
                {/* Ruta de Login */}
                <Route 
                  path="/sign-in/*" 
                  element={
                    <div className="flex h-screen w-full items-center justify-center bg-background">
                      <SignIn routing="path" path="/sign-in" />
                    </div>
                  } 
                />

                {/* Ruta de Registro */}
                <Route 
                  path="/sign-up/*" 
                  element={
                    <div className="flex h-screen w-full items-center justify-center bg-background">
                      <SignUp routing="path" path="/sign-up" />
                    </div>
                  } 
                />

                {/* Ruta Principal Protegida */}
                <Route
                  path="/*"
                  element={
                    <>
                      <SignedIn>
                        <AppContent />
                      </SignedIn>
                      <SignedOut>
                         {/* Si entra a la raíz y no está logueado, REDIRIGIR al login */}
                         <RedirectToSignIn />
                      </SignedOut>
                    </>
                  }
                />
              </Routes>
            </ClerkLoaded>
            
        </ConfigProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <ClerkProviderWithRoutes />
        </BrowserRouter>
    );
};

export default App;