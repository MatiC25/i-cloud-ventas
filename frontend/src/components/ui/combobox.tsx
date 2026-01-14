"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover-standard"

interface ComboboxProps {
    options: (string | { value: string; label: string; icon?: React.ComponentType<{ className?: string }> })[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    emptyText?: string
    className?: string
    disabled?: boolean
}

export function Combobox({
    options = [],
    value,
    onChange,
    placeholder = "Seleccionar...",
    emptyText = "No encontrado.",
    className,
    disabled = false
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const normalizedOptions = React.useMemo(() => {
        return options.map(o => typeof o === 'string' ? { value: o, label: o, icon: null } : o)
    }, [options])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-9 bg-background font-normal", !value && "text-muted-foreground", className)}
                    disabled={disabled}
                >
                    {value
                        ? normalizedOptions.find((option) => option.value === value)?.label || value
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder={`Buscar ${placeholder.toLowerCase()}...`}
                        onKeyDown={(e) => {
                            if (e.key === "Tab") {
                                e.preventDefault()
                                // Simular ArrowDown para navegar con Tab
                                const event = new KeyboardEvent("keydown", {
                                    key: "ArrowDown",
                                    code: "ArrowDown",
                                    bubbles: true,
                                    cancelable: true,
                                    composed: true
                                })
                                e.currentTarget.dispatchEvent(event)
                            }
                        }}
                    />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {normalizedOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label} // Use label for search filtering
                                    onSelect={(currentValue) => {
                                        // currentValue comes from cmdk lowercased label usually
                                        // We find the option that matches this label (fuzzy) or value
                                        const selected = normalizedOptions.find(o => o.label.toLowerCase() === currentValue.toLowerCase() || o.value === currentValue)
                                        if (selected) {
                                            onChange(selected.value)
                                        }
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
