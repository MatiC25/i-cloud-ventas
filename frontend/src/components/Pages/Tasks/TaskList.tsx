import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Trash2,
    ExternalLink,
    Calendar,
    User,
    CheckCircle2,
    Circle,
    HelpCircle,
    Clock,
    Pencil,
    ListFilter,
    XCircle
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ITaskUI } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface TaskListProps {
    tasks: ITaskUI[];
    onToggleStatus: (task: ITaskUI) => void;
    onDelete: (id: string) => void;
    onEdit: (task: ITaskUI) => void;
}

function getBadgeStyles(tipo: string) {
    switch (tipo) {
        case "EntregaProducto": return "bg-emerald-600 text-white border-transparent hover:bg-emerald-700";
        case "Soporte": return "bg-rose-600 text-white border-transparent hover:bg-rose-700";
        case "Administrativo": return "bg-blue-600 text-white border-transparent hover:bg-blue-700";
        default: return "bg-slate-600 text-white border-transparent";
    }
}

export function TaskList({ tasks, onToggleStatus, onDelete, onEdit }: TaskListProps) {
    // --- ESTADOS LOCALES PARA FILTROS ---
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | "all">("all");

    // --- LÓGICA DE FILTRADO ---
    const filteredTasks = tasks.filter((task) => {
        // 1. Filtro de Texto (Busca en descripción o cliente)
        const matchesSearch =
            task.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.cliente && task.cliente.toLowerCase().includes(searchTerm.toLowerCase()));

        // 2. Filtro de Estado
        const matchesStatus = statusFilter === "all" || task.estado === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Si no hay tareas en absoluto (BD vacía)
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg bg-muted/10">
                <p className="text-muted-foreground text-sm">No hay tareas pendientes.</p>
                <p className="text-xs text-slate-400 mt-1">¡Crea una nueva para empezar!</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* TOOLBAR */}
            <div className="flex items-center justify-between gap-2">

                {/* BUSCADOR */}
                <div className="relative w-full max-w-sm">
                    <input
                        placeholder="Filtrar por descripción o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>

                {/* FILTRO DE ESTADO (DROPDOWN) */}
                <div className="flex items-center gap-2">
                    {/* Botón para limpiar filtros si hay alguno activo */}
                    {(statusFilter !== "all" || searchTerm) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setStatusFilter("all"); setSearchTerm(""); }}
                            className="h-8 px-2 text-xs text-muted-foreground"
                        >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Limpiar
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 border-dashed">
                                <ListFilter className="mr-2 h-4 w-4" />
                                Estado
                                {statusFilter !== "all" && (
                                    <>
                                        <div className="mx-2 h-4 w-[1px] bg-border" />
                                        <Badge variant="secondary" className="rounded-sm px-1 font-normal text-[10px]">
                                            {statusFilter}
                                        </Badge>
                                    </>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={statusFilter === "all"}
                                onCheckedChange={() => setStatusFilter("all")}
                            >
                                Todos
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={statusFilter === "Pendiente"}
                                onCheckedChange={() => setStatusFilter("Pendiente")}
                            >
                                Pendiente
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={statusFilter === "En Progreso"}
                                onCheckedChange={() => setStatusFilter("En Progreso")}
                            >
                                En Progreso
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={statusFilter === "Completada"}
                                onCheckedChange={() => setStatusFilter("Completada")}
                            >
                                Completada
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* TABLA */}
            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-muted/5">
                            <TableHead className="w-[30px] pl-4"></TableHead>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="w-[180px]">Auditoría</TableHead>
                            <TableHead className="w-[140px]">Estado</TableHead>
                            <TableHead className="w-[100px] text-right pr-4">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    onToggle={() => onToggleStatus(task)}
                                    onDelete={() => onDelete(task.id)}
                                    onEdit={() => onEdit(task)}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No se encontraron resultados para los filtros aplicados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-xs text-muted-foreground px-2 flex justify-between">
                <span>Mostrando {filteredTasks.length} de {tasks.length} tareas</span>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTE: TaskRow ---

function TaskRow({
    task,
    onToggle,
    onDelete,
    onEdit
}: {
    task: ITaskUI;
    onToggle: () => void;
    onDelete: () => void;
    onEdit: () => void;
}) {
    const isCompleted = task.estado === "Completada";

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Completada": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case "En Progreso": return <Clock className="h-4 w-4 text-blue-500" />;
            case "Pendiente": return <Circle className="h-4 w-4 text-slate-400" />;
            default: return <HelpCircle className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <TableRow className={cn("group transition-colors", isCompleted && "bg-muted/30")}>
            {/* 1. CHECKBOX */}
            <TableCell className="py-3 pr-0 pl-4 w-[30px] align-top">
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={onToggle}
                    disabled={task.isTemp}
                    className="translate-y-[2px] data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 border-slate-400"
                />
            </TableCell>

            {/* 2. TASK ID */}
            <TableCell className="py-3 font-mono text-[10px] text-muted-foreground align-top pt-4">
                {task.id ? task.id.substring(0, 6).toUpperCase() : "..."}
            </TableCell>

            {/* 3. TITLE (Badge + Desc) */}
            <TableCell className="py-3 align-top">
                <div className="flex flex-col space-y-1.5">
                    <div className="flex items-start gap-2">
                        <Badge
                            variant="outline"
                            className={cn(
                                "mt-0.5 text-[10px] h-5 px-2 py-0 font-semibold border shrink-0", // Estructura base
                                getBadgeStyles(task.tipo) // <--- AQUI INYECTAMOS EL COLOR
                            )}
                        >
                            {task.tipo}
                        </Badge>
                        <span className={cn("text-sm font-medium leading-tight", isCompleted && "line-through text-muted-foreground")}>
                            {task.descripcion}
                        </span>
                    </div>

                    {/* Metadata secundaria */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pl-1">
                        {task.cliente && (
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {task.cliente}
                            </span>
                        )}

                        {task.created_at && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {!isNaN(Date.parse(task.created_at))
                                    ? format(new Date(task.created_at), "d MMM", { locale: es })
                                    : "Hoy"}
                            </span>
                        )}

                        {task.link && (
                            <a href={task.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline">
                                <ExternalLink className="h-3 w-3" /> Ref
                            </a>
                        )}

                        {task.isTemp && <span className="text-amber-500 font-semibold animate-pulse">Guardando...</span>}
                    </div>
                </div>
            </TableCell>

            <TableCell className="py-3 flex items-center pt-4">

                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-500">
                    {task.auditoria ? task.auditoria.charAt(0).toUpperCase() : <User size={8} />}
                </div>
                <span className="text-xs text-gray-500">{task.auditoria}</span>
            </TableCell>

            {/* 4. STATUS */}
            <TableCell className="py-3 align-top pt-4">
                <div className="flex items-center gap-2 text-xs">
                    {getStatusIcon(task.estado)}
                    <span className={isCompleted ? "text-muted-foreground" : "text-foreground"}>
                        {task.estado}
                    </span>
                </div>
            </TableCell>

            {/* 5. ACTIONS (Visibles SIEMPRE) */}
            <TableCell className="py-3 align-top pt-3 text-right pr-4">
                {/* Eliminada la clase opacity-0 group-hover:opacity-100 */}
                <div className="flex items-center justify-end gap-1">

                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={task.isTemp}
                        onClick={onEdit} // Esto llama a la función del padre
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-80"
                        title="Editar Tarea"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={task.isTemp}
                        onClick={onDelete}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-80"
                        title="Eliminar Tarea"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                </div>
            </TableCell>
        </TableRow>
    );
}