import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp, Search, Calendar as CalendarIcon, Filter, RefreshCcw, SlidersHorizontal } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format, subDays, subMonths } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    loading?: boolean
    onRefresh?: () => void
    toolbarActions?: React.ReactNode
    title?: string // New prop
    defaultOpen?: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    loading,
    onRefresh,
    toolbarActions,
    title = "Tabla de Datos", // Default title
    defaultOpen = true,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
    const [isExpanded, setIsExpanded] = React.useState(defaultOpen) // Expanded by default based on prop

    // Custom filter function for dates
    React.useEffect(() => {
        if (dateRange?.from) {
            const from = dateRange.from;
            const to = dateRange.to || dateRange.from;

            setColumnFilters(prev => {
                const otherFilters = prev.filter(f => f.id !== "fecha");
                return [
                    ...otherFilters,
                    {
                        id: "fecha",
                        value: { from, to }
                    }
                ]
            })
        } else {
            setColumnFilters(prev => prev.filter(f => f.id !== "fecha"));
        }
    }, [dateRange])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,

        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        filterFns: {
            // Define a custom filter for handling date ranges if needed
            inDateRange: (row, columnId, value: { from: Date, to: Date }) => {
                const dateValue = new Date(row.getValue(columnId));
                if (!value) return true;
                // Reset types for comparison
                const cellDate = new Date(dateValue.setHours(0, 0, 0, 0));
                const from = new Date(value.from.setHours(0, 0, 0, 0));
                const to = new Date(value.to.setHours(0, 0, 0, 0));

                return cellDate >= from && cellDate <= to;
            }
        }
    })

    // Apply custom filter function to "fecha" column if it exists
    React.useEffect(() => {
        const fechaColumn = table.getColumn("fecha");
        if (fechaColumn) {
            fechaColumn.columnDef.filterFn = "inDateRange" as any;
        }
    }, [table.getColumn("fecha")])

    return (
        <div className="w-full space-y-4 border rounded-lg p-4 bg-background">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                <Button variant="ghost" size="sm">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
            </div>

            {isExpanded && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search - Left aligned */}
                        <div className="flex flex-1 items-center space-x-2">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar..."
                                    value={globalFilter ?? ""}
                                    onChange={(event) =>
                                        setGlobalFilter(event.target.value)
                                    }
                                    className="pl-8 h-9 w-[150px] lg:w-[250px]"
                                />
                            </div>
                        </div>

                        {/* Filters & Actions - Right aligned */}
                        <div className="flex items-center space-x-2">
                            {/* Date Presets Filter */}
                            <Select
                                defaultValue="all"
                                onValueChange={(value) => {
                                    const now = new Date();
                                    if (value === "all") {
                                        setDateRange(undefined);
                                    } else if (value === "today") {
                                        setDateRange({ from: now, to: now });
                                    } else if (value === "week") {
                                        setDateRange({ from: subDays(now, 7), to: now });
                                    } else if (value === "month") {
                                        setDateRange({ from: subMonths(now, 1), to: now });
                                    }
                                }}
                            >
                                <SelectTrigger className="w-[180px] h-9">
                                    <SelectValue placeholder="Filtrar por fecha" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Siempre</SelectItem>
                                    <SelectItem value="today">Hoy</SelectItem>
                                    <SelectItem value="week">Última semana</SelectItem>
                                    <SelectItem value="month">Último mes</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Column Visibility */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 lg:flex">
                                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                                        Vistas
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Alternar columnas</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {table
                                        .getAllColumns()
                                        .filter(
                                            (column) => column.getCanHide()
                                        )
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) =>
                                                        column.toggleVisibility(!!value)
                                                    }
                                                    onSelect={(e) => e.preventDefault()}
                                                >
                                                    {column.id}
                                                </DropdownMenuCheckboxItem>
                                            )
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Refresh Button */}
                            {onRefresh && (
                                <Button variant="outline" size="icon" className="h-9 w-9" onClick={onRefresh}>
                                    <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                                </Button>
                            )}

                            {/* Custom Toolbar Actions */}
                            {toolbarActions}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, rowIndex) => (
                                        <TableRow key={`skeleton-${rowIndex}`}>
                                            {columns.map((col, colIndex) => (
                                                <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                                                    <Skeleton className="h-4 w-full" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No hay resultados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            {table.getFilteredSelectedRowModel().rows.length} de{" "}
                            {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
