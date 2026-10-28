"use client";

import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bike, CarFront, LoaderCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { MIN_YEAR, USAGE_BY_VEHICLE, USAGE_LABELS, type VehicleType } from "@/lib/constants";
import { leadFormSchema, type LeadFormInput, type LeadFormData } from "@/lib/validation/lead-form";
import { CatalogCombobox, type CatalogOption } from "./catalog-combobox";
import { submitLead } from "@/server/actions/submit-lead";
import { DATABASE_ERROR_MESSAGE } from "@/lib/leads/submit-result";
import { toast } from "sonner";
import { TurnstileWidget } from "./turnstile-widget";
import { LeadConfirmation } from "./lead-confirmation";

export type VehicleBrandOption = CatalogOption & { vehicleType: VehicleType };
type Props = {
  brands: VehicleBrandOption[];
  initialVehicleType?: VehicleType;
  catalogUnavailable?: boolean;
  whatsappUrl?: string;
};
type TextName =
  | "fullName"
  | "phone"
  | "email"
  | "dni"
  | "plate"
  | "brandOther"
  | "modelOther"
  | "year"
  | "postalCode";
const modelsSchema = z.array(z.object({ id: z.string(), name: z.string() }));

export function LeadForm({
  brands,
  initialVehicleType = "AUTO",
  catalogUnavailable = false,
  whatsappUrl,
}: Props) {
  const prefix = useId();
  const [otherBrand, setOtherBrand] = useState(false);
  const [otherModel, setOtherModel] = useState(false);
  const [catalog, setCatalog] = useState<{
    brandId: string;
    models: CatalogOption[];
    error: boolean;
  } | null>(null);
  const [retry, setRetry] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [submittedWhatsappUrl, setSubmittedWhatsappUrl] = useState<string | null>(null);
  const returningToForm = useRef(false);
  const [requestNumber, setRequestNumber] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const submitPending = useRef(false);
  const form = useForm<LeadFormInput, unknown, LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      vehicleType: initialVehicleType,
      fullName: "",
      phoneArea: "",
      phoneNumber: "",
      phone: "",
      email: "",
      dni: "",
      isZeroKm: false,
      plate: "",
      brandId: "",
      brandOther: "",
      modelId: "",
      modelOther: "",
      year: "",
      hasGnc: null,
      postalCode: "",
      consent: false,
      website: "",
    },
  });
  const [vehicleType, brandId, isZeroKm] = useWatch({
    control: form.control,
    name: ["vehicleType", "brandId", "isZeroKm"],
  });
  const loadingModels = !!brandId && catalog?.brandId !== brandId;
  const modelError = !!brandId && catalog?.brandId === brandId && catalog.error;
  const models = catalog && catalog.brandId === brandId ? catalog.models : [];

  useEffect(() => {
    if (!submitted && returningToForm.current) {
      form.setFocus("fullName");
      returningToForm.current = false;
    }
  }, [form, submitted]);

  useEffect(() => {
    if (!brandId) return;
    const controller = new AbortController();
    let active = true;
    fetch(`/api/vehicles/models?brandId=${encodeURIComponent(brandId)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalog unavailable");
        return modelsSchema.parse(await response.json());
      })
      .then((items) => {
        if (active) setCatalog({ brandId, models: items, error: false });
      })
      .catch(() => {
        if (active) setCatalog({ brandId, models: [], error: true });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [brandId, retry]);

  const id = (name: string) => `${prefix}-${name}`;
  const errorFor = (name: TextName) =>
    form.formState.errors[name] ??
    (name === "modelOther" ? form.formState.errors.modelId : undefined);
  const text = (
    name: TextName,
    label: string,
    props: ComponentProps<typeof Input> = {},
    description?: string,
  ) => (
    <Controller
      key={name}
      name={name}
      control={form.control}
      render={({ field, fieldState }) => {
        const error = fieldState.error ?? errorFor(name);
        return (
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor={id(name)}>{label}</FieldLabel>
            <Input
              {...field}
              {...props}
              value={String(field.value ?? "")}
              id={id(name)}
              className="quote-control"
              aria-invalid={!!error}
              aria-describedby={
                [description ? id(`${name}-hint`) : "", error ? id(`${name}-error`) : ""]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              onBlur={() => {
                field.onBlur();
                if (name === "modelOther") void form.trigger(["modelId", "modelOther"]);
                if (name === "brandOther") void form.trigger(["brandId", "brandOther"]);
              }}
            />
            {description && (
              <FieldDescription id={id(`${name}-hint`)}>{description}</FieldDescription>
            )}
            <FieldError id={id(`${name}-error`)} errors={[error]} />
          </Field>
        );
      }}
    />
  );
  const resetModel = () => {
    form.resetField("modelId");
    form.resetField("modelOther");
    setOtherModel(false);
  };
  const submit = async (data: LeadFormData) => {
    if (!turnstileToken) {
      setTurnstileError("Completá la verificación de seguridad antes de enviar.");
      submitPending.current = false;
      return;
    }

    try {
      const result = await submitLead(data, turnstileToken);
      if (!result.ok) {
        for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
          const message = messages?.[0];
          if (message) form.setError(name as keyof LeadFormInput, { type: "server", message });
        }
        if (!result.fieldErrors) toast.error(result.message || DATABASE_ERROR_MESSAGE);
        return;
      }
      setRequestNumber(result.requestNumber);
      setSubmittedLeadId(result.leadId);
      setSubmittedWhatsappUrl(result.whatsappUrl);
      setSubmitted(true);
    } catch {
      toast.error(DATABASE_ERROR_MESSAGE);
    } finally {
      setTurnstileToken(null);
      setTurnstileResetKey((value) => value + 1);
      submitPending.current = false;
    }
  };

  const startAnotherQuote = () => {
    form.reset();
    setOtherBrand(false);
    setOtherModel(false);
    setCatalog(null);
    setTurnstileToken(null);
    setTurnstileError(null);
    setTurnstileResetKey((value) => value + 1);
    setRequestNumber(null);
    setSubmittedLeadId(null);
    setSubmittedWhatsappUrl(null);
    submitPending.current = false;
    returningToForm.current = true;
    setSubmitted(false);
  };

  if (submitted && requestNumber && submittedLeadId && submittedWhatsappUrl) {
    return (
      <LeadConfirmation
        leadId={submittedLeadId}
        requestNumber={requestNumber}
        whatsappUrl={submittedWhatsappUrl}
        onNewQuote={startAnotherQuote}
      />
    );
  }

  return (
    <form
      className="lead-form"
      noValidate
      aria-label="Formulario de cotización"
      onSubmit={(event) => {
        if (submitPending.current) {
          event.preventDefault();
          return;
        }
        if (form.getValues("website")?.trim()) {
          event.preventDefault();
          return;
        }
        submitPending.current = true;
        setTurnstileError(null);
        setSubmitted(false);
        setRequestNumber(null);
        void form
          .handleSubmit(submit, (errors) => {
            const first = (
              [
                "fullName",
                "phone",
                "email",
                "plate",
                "brandId",
                "brandOther",
                "modelId",
                "modelOther",
                "year",
                "postalCode",
                "usage",
                "dni",
                "consent",
              ] as const
            ).find((name) => errors[name]);
            if (first) form.setFocus(first === "modelId" && otherBrand ? "modelOther" : first);
            submitPending.current = false;
          })(event)
          .catch(() => {
            submitPending.current = false;
            toast.error(DATABASE_ERROR_MESSAGE);
          });
      }}
    >
      <p className="form-intro">
        Completá tus datos y los de tu vehículo. La patente no es obligatoria si tu vehículo es 0
        km.
      </p>
      <FieldGroup>
        <Controller
          name="vehicleType"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel id={id("vehicleType-label")}>¿Qué querés asegurar?</FieldLabel>
              <div
                className="vehicle-picker"
                role="group"
                aria-labelledby={id("vehicleType-label")}
              >
                {(["AUTO", "MOTO"] as const).map((type) => {
                  const Icon = type === "AUTO" ? CarFront : Bike;
                  return (
                    <Button
                      type="button"
                      variant="outline"
                      key={type}
                      aria-pressed={field.value === type}
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      onClick={() => {
                        if (type === field.value) return;
                        field.onChange(type);
                        form.resetField("brandId");
                        form.resetField("brandOther");
                        resetModel();
                        form.resetField("usage");
                        form.resetField("hasGnc");
                        setOtherBrand(false);
                      }}
                    >
                      <Icon aria-hidden="true" />
                      {type === "AUTO" ? "Auto" : "Moto"}
                    </Button>
                  );
                })}
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        {text("fullName", "Nombre y apellido", { autoComplete: "name", maxLength: 100 })}
        {text(
          "phone",
          "Teléfono",
          { type: "tel", inputMode: "tel", autoComplete: "tel" },
          "Incluí el código de área, sin 0 ni 15. Por ejemplo: 341 4123456.",
        )}
        {text("email", "Email", { type: "email", autoComplete: "email", autoCapitalize: "none" })}
        <Controller
          name="isZeroKm"
          control={form.control}
          render={({ field }) => (
            <Field>
              <div className="form-check">
                <Checkbox
                  id={id("isZeroKm")}
                  ref={field.ref}
                  checked={field.value}
                  onBlur={field.onBlur}
                  onCheckedChange={(checked) => {
                    field.onChange(checked === true);
                    form.clearErrors("plate");
                  }}
                />
                <FieldLabel htmlFor={id("isZeroKm")}>Es 0 km</FieldLabel>
              </div>
            </Field>
          )}
        />
        {text(
          "plate",
          isZeroKm ? "Patente (opcional)" : "Patente",
          { autoCapitalize: "characters" },
          vehicleType === "AUTO"
            ? "Por ejemplo: AAA123 o AA123BB."
            : "Por ejemplo: 123ABC o A123BCD.",
        )}
        {catalogUnavailable && (
          <p role="status" className="text-sm text-muted-foreground">
            No pudimos cargar el catálogo. Podés elegir Otro e ingresar marca y modelo.
          </p>
        )}
        <Controller
          name="brandId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={id("brandId")}>Marca</FieldLabel>
              <CatalogCombobox
                id={id("brandId")}
                label="Marca"
                controlRef={field.ref}
                value={otherBrand ? "other" : (field.value ?? "")}
                options={brands.filter((brand) => brand.vehicleType === vehicleType)}
                invalid={fieldState.invalid}
                describedBy={fieldState.error ? id("brandId-error") : undefined}
                onBlur={field.onBlur}
                onChange={(value) => {
                  setOtherBrand(value === "other");
                  field.onChange(value === "other" ? "" : value);
                  form.resetField("brandOther");
                  resetModel();
                }}
              />
              <FieldError id={id("brandId-error")} errors={[fieldState.error]} />
            </Field>
          )}
        />
        {otherBrand && text("brandOther", "Otra marca", { maxLength: 40 })}
        {otherBrand ? (
          text("modelOther", "Modelo", { maxLength: 60 })
        ) : (
          <>
            <Controller
              name="modelId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={id("modelId")}>Modelo</FieldLabel>
                  <CatalogCombobox
                    id={id("modelId")}
                    label="Modelo"
                    controlRef={field.ref}
                    value={otherModel ? "other" : (field.value ?? "")}
                    options={models}
                    invalid={fieldState.invalid}
                    disabled={!brandId || loadingModels}
                    describedBy={[id("modelId-hint"), fieldState.error ? id("modelId-error") : ""]
                      .filter(Boolean)
                      .join(" ")}
                    onBlur={field.onBlur}
                    onChange={(value) => {
                      setOtherModel(value === "other");
                      field.onChange(value === "other" ? "" : value);
                      form.resetField("modelOther");
                    }}
                  />
                  <FieldDescription id={id("modelId-hint")} aria-live="polite">
                    {loadingModels
                      ? "Cargando modelos…"
                      : modelError
                        ? "No pudimos cargar los modelos. Reintentá o elegí Otro."
                        : !brandId
                          ? "Primero seleccioná una marca."
                          : "Si no encontrás tu modelo, elegí Otro."}
                  </FieldDescription>
                  <FieldError id={id("modelId-error")} errors={[fieldState.error]} />
                  {modelError && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCatalog(null);
                        setRetry((value) => value + 1);
                      }}
                    >
                      Reintentar modelos
                    </Button>
                  )}
                </Field>
              )}
            />
            {otherModel && text("modelOther", "Otro modelo", { maxLength: 60 })}
          </>
        )}
        {text(
          "year",
          "Año del vehículo",
          { inputMode: "numeric" },
          `Entre ${MIN_YEAR} y ${new Date().getFullYear() + 1}.`,
        )}
        {vehicleType === "AUTO" && (
          <Controller
            name="hasGnc"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={id("hasGnc")}>¿Tiene GNC?</FieldLabel>
                <select
                  id={id("hasGnc")}
                  ref={field.ref}
                  className="quote-control"
                  value={field.value == null ? "" : String(field.value)}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(event.target.value === "" ? null : event.target.value === "true")
                  }
                >
                  <option value="">Seleccioná una opción (opcional)</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </Field>
            )}
          />
        )}
        {text(
          "postalCode",
          "Código postal",
          { autoComplete: "postal-code", autoCapitalize: "characters" },
          "4 dígitos o CPA, por ejemplo S2000ABC.",
        )}
        <Controller
          name="usage"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={id("usage")}>Tipo de uso</FieldLabel>
              <select
                {...field}
                value={field.value ?? ""}
                id={id("usage")}
                className="quote-control"
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.error ? id("usage-error") : undefined}
              >
                <option value="">Seleccioná el uso</option>
                {USAGE_BY_VEHICLE[vehicleType].map((usage) => (
                  <option key={usage} value={usage}>
                    {USAGE_LABELS[usage]}
                  </option>
                ))}
              </select>
              <FieldError id={id("usage-error")} errors={[fieldState.error]} />
            </Field>
          )}
        />
        {text("dni", "DNI", { inputMode: "numeric" })}
        <Controller
          name="consent"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="form-check">
                <Checkbox
                  id={id("consent")}
                  ref={field.ref}
                  checked={field.value}
                  onBlur={field.onBlur}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? id("consent-error") : undefined}
                />
                <FieldLabel htmlFor={id("consent")} className="block leading-relaxed">
                  Acepto la{" "}
                  <a
                    href="/privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    política de privacidad
                    <span className="sr-only"> (se abre en otra pestaña)</span>
                  </a>
                  .
                </FieldLabel>
              </div>
              <FieldError id={id("consent-error")} errors={[fieldState.error]} />
            </Field>
          )}
        />
        <div className="form-honeypot" aria-hidden="true">
          <label htmlFor={id("website")}>Sitio web</label>
          <input
            {...form.register("website")}
            id={id("website")}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <TurnstileWidget
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          whatsappUrl={whatsappUrl}
          resetKey={turnstileResetKey}
          onTokenChange={(token) => {
            setTurnstileToken(token);
            if (token) setTurnstileError(null);
          }}
        />
        {turnstileError && (
          <p className="text-sm text-destructive" aria-live="polite">
            {turnstileError}
          </p>
        )}
        <Button
          type="submit"
          className="quote-button w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          )}
          {form.formState.isSubmitting ? "Validando…" : "Iniciar cotización"}
        </Button>
        <p className="form-demo-note" role="status">
          Al enviar, vamos a registrar tu solicitud para que un asesor pueda contactarte.
        </p>
      </FieldGroup>
    </form>
  );
}
