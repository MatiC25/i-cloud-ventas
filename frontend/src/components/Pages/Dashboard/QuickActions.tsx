import { Button } from "@/components/ui/button"
import { PlusCircle, Wallet, ArrowRightLeft } from "lucide-react"
import { useNavigation } from "@/components/Layout/NavigationContext"
import { useState } from "react"
import { NuevaOperacion } from "../Estadisticas/NuevaOperacion"
import { NuevaTask } from "../Tasks/NuevaTask"

type QuickActionsProps = {
    refetchOperaciones?: () => void
}

export function QuickActions({ refetchOperaciones }: QuickActionsProps) {
    const { setActiveTab } = useNavigation()
    const [openNuevaOperacion, setOpenNuevaOperacion] = useState(false)
    const [openNuevaTask, setOpenNuevaTask] = useState(false);

    const actions = [
        {
            label: "Nueva Venta",
            icon: PlusCircle,
            iconColor: "text-white",
            iconBg: "bg-emerald-500 shadow-emerald-500/40",
            borderColor: "border-emerald-200 dark:border-emerald-800",
            bgColor: "bg-emerald-50/50 dark:bg-emerald-950/20",
            hoverBorder: "hover:border-emerald-500",
            hoverBg: "hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40",
            hoverShadow: "hover:shadow-emerald-500/20",
            onClick: () => setActiveTab("nueva-venta-minimalista"),
        },
        {
            label: "Registrar Gasto",
            icon: Wallet,
            iconColor: "text-white",
            iconBg: "bg-red-500 shadow-red-500/40",
            borderColor: "border-red-200 dark:border-red-800",
            bgColor: "bg-red-50/50 dark:bg-red-950/20",
            hoverBorder: "hover:border-red-500",
            hoverBg: "hover:bg-red-100/50 dark:hover:bg-red-900/40",
            hoverShadow: "hover:shadow-red-500/20",
            onClick: () => setOpenNuevaOperacion(true),
        },
        {
            label: "Agendar Tarea",
            icon: ArrowRightLeft,
            iconColor: "text-white",
            iconBg: "bg-blue-500 shadow-blue-500/40",
            borderColor: "border-blue-200 dark:border-blue-800",
            bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
            hoverBorder: "hover:border-blue-500",
            hoverBg: "hover:bg-blue-100/50 dark:hover:bg-blue-900/40",
            hoverShadow: "hover:shadow-blue-500/20",
            onClick: () => setOpenNuevaTask(true),
        },
    ]

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {actions.map((action, index) => (
                    <Button
                        key={index}
                        onClick={action.onClick}
                        variant="ghost"
                        className={`h-32 flex flex-col items-center justify-center gap-3 border ${action.borderColor} ${action.bgColor} ${action.hoverBorder} ${action.hoverBg} ${action.hoverShadow} shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden`}
                    >
                        <div
                            className={`p-3.5 rounded-full ${action.iconBg} ${action.iconColor} shadow-md group-hover:scale-110 transition-transform duration-300`}
                        >
                            <action.icon className="h-7 w-7" />
                        </div>

                        <span className="font-bold text-sm text-foreground/90 group-hover:text-foreground transition-colors">
                            {action.label}
                        </span>

                        <div
                            className={`absolute -right-6 -top-6 w-20 h-20 rounded-full ${action.iconBg} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                        />
                    </Button>
                ))}
            </div>

            {/* MODAL */}
            <NuevaOperacion
                open={openNuevaOperacion}
                onOpenChange={setOpenNuevaOperacion}
                onRefresh={refetchOperaciones}
            />

            <NuevaTask
                open={openNuevaTask}
                onOpenChange={setOpenNuevaTask}
            />

        </>
    )
}
