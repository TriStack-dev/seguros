"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LeadsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("search") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const vehicleType = searchParams.get("vehicleType") ?? "";
  const status = searchParams.get("status") ?? "";

  function updateParams(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());
    const values = {
      search: String(formData.get("search") ?? "").trim(),
      from: String(formData.get("from") ?? ""),
      to: String(formData.get("to") ?? ""),
      vehicleType: String(formData.get("vehicleType") ?? ""),
      status: String(formData.get("status") ?? ""),
    };

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page"); // reset page when filters change

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <form
      action={updateParams}
      className="mb-6 grid gap-3 rounded-md border p-4 md:grid-cols-2 lg:grid-cols-6"
    >
      <div className="lg:col-span-2">
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          name="search"
          defaultValue={search}
          placeholder="Nombre, DNI, teléfono, patente, MS-000123"
        />
      </div>
      <div>
        <Label htmlFor="from">Desde</Label>
        <Input id="from" name="from" type="date" defaultValue={from} />
      </div>
      <div>
        <Label htmlFor="to">Hasta</Label>
        <Input id="to" name="to" type="date" defaultValue={to} />
      </div>
      <div>
        <Label htmlFor="vehicleType">Tipo</Label>
        <Select name="vehicleType" defaultValue={vehicleType || "all"}>
          <SelectTrigger id="vehicleType">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="AUTO">Auto</SelectItem>
            <SelectItem value="MOTO">Moto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="status">Estado</Label>
        <Select name="status" defaultValue={status || "all"}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="NEW">Nuevo</SelectItem>
            <SelectItem value="CONTACTED">Contactado</SelectItem>
            <SelectItem value="QUOTED">Cotizado</SelectItem>
            <SelectItem value="ISSUED">Emitido</SelectItem>
            <SelectItem value="LOST">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end gap-2 lg:col-span-6">
        <Button type="submit" disabled={isPending}>
          Aplicar filtros
        </Button>
        <Button type="button" variant="outline" onClick={clearFilters} disabled={isPending}>
          Limpiar
        </Button>
      </div>
    </form>
  );
}
