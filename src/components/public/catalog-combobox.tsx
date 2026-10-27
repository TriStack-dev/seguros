"use client";

import { useId, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type CatalogOption = { id: string; name: string };

type Props = {
  id: string;
  label: string;
  value: string;
  options: CatalogOption[];
  disabled?: boolean;
  invalid: boolean;
  describedBy?: string;
  controlRef: (element: HTMLButtonElement | null) => void;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function CatalogCombobox({
  id,
  label,
  value,
  options,
  disabled,
  invalid,
  describedBy,
  controlRef,
  onChange,
  onBlur,
}: Props) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const choices = [...options, { id: "other", name: "Otro" }];
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          ref={controlRef}
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          disabled={disabled}
          onBlur={() => {
            if (!open) onBlur();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          className="quote-control w-full justify-between font-normal"
        >
          <span className="truncate">
            {choices.find((option) => option.id === value)?.name ??
              `Seleccioná ${label.toLowerCase()}`}
          </span>
          <ChevronsUpDown aria-hidden="true" className="shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput
            aria-label={`Buscar ${label.toLowerCase()}`}
            placeholder={`Buscá ${label.toLowerCase()}…`}
          />
          <CommandList id={listId}>
            <CommandEmpty>No hay coincidencias. Probá otra búsqueda.</CommandEmpty>
            <CommandGroup>
              {choices.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  keywords={[option.name]}
                  onSelect={() => {
                    onChange(option.id);
                    setOpen(false);
                    onBlur();
                  }}
                  className="min-h-11"
                >
                  {option.name}
                  <Check
                    aria-hidden="true"
                    className={`ml-auto ${value === option.id ? "opacity-100" : "opacity-0"}`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
