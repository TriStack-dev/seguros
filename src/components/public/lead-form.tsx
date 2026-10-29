"use client";

import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Bike, CarFront, Check, LoaderCircle } from "lucide-react";
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
import { track } from "@/lib/analytics/track";
import { LeadConfirmation } from "./lead-confirmation";

export type VehicleBrandOption = CatalogOption & { vehicleType: VehicleType };
type Props = {
  brands: VehicleBrandOption[];
  compact?: boolean;
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
const COMPACT_STAGE_FIELDS = [
  ["fullName", "phone", "email", "dni"],
  ["vehicleType", "plate", "brandId", "brandOther", "modelId", "modelOther", "year"],
  ["hasGnc", "postalCode", "usage", "consent"],
] as const;
const COMPACT_STAGE_LABELS = ["Tus datos", "Vehículo", "Envío"] as const;
const COMPACT_STAGE_DESCRIPTIONS = [
  "Empezá con tus datos de contacto.",
  "Ahora, contanos sobre tu vehículo.",
  "Completá el uso y enviá tu solicitud.",
] as const;
type CompactField = (typeof COMPACT_STAGE_FIELDS)[number][number];
const compactStepForField = (field: string) =>
  COMPACT_STAGE_FIELDS.findIndex((fields) => (fields as readonly string[]).includes(field));

export function LeadForm({
  brands,
  compact = false,
  initialVehicleType = "AUTO",
  catalogUnavailable = false,
  whatsappUrl,
}: Props) {
  const prefix = useId();
  const viewed = useRef(false);
  const started = useRef(false);
  const [confirmedVehicleType, setConfirmedVehicleType] = useState(initialVehicleType);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track("form_view", { vehicle_type: initialVehicleType });
  }, [initialVehicleType]);
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
  const [isAdvancing, setIsAdvancing] = useState(false);
  const submitPending = useRef(false);
  const transitionPending = useRef(false);
  const [compactStep, setCompactStep] = useState(0);
  const stageFieldsetRef = useRef<HTMLFieldSetElement>(null);
  const previousCompactStep = useRef(compactStep);
  const pendingFocusField = useRef<CompactField | null>(null);
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
    if (!compact || previousCompactStep.current === compactStep) return;
    previousCompactStep.current = compactStep;
    if (pendingFocusField.current) {
      const field = pendingFocusField.current;
      pendingFocusField.current = null;
      form.setFocus(field === "modelId" && otherBrand ? "modelOther" : field);
      return;
    }
    stageFieldsetRef.current?.focus();
  }, [compact, compactStep, form, otherBrand]);

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
    layoutClass?: string,
  ) => (
    <Controller
      key={name}
      name={name}
      control={form.control}
      render={({ field, fieldState }) => {
        const error = fieldState.error ?? errorFor(name);
        return (
          <Field data-invalid={!!error} className={compact ? layoutClass : undefined}>
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
  const advanceCompactStep = async () => {
    const fields = COMPACT_STAGE_FIELDS[compactStep];
    if (
      !compact ||
      !fields ||
      compactStep >= COMPACT_STAGE_FIELDS.length - 1 ||
      transitionPending.current
    )
      return;
    transitionPending.current = true;
    setIsAdvancing(true);
    try {
      const valid = await form.trigger([...fields]);
      if (!valid) {
        const first = fields.find((field) => form.getFieldState(field).error);
        if (first) form.setFocus(first === "modelId" && otherBrand ? "modelOther" : first);
        return;
      }
      setCompactStep((step) => Math.min(step + 1, COMPACT_STAGE_FIELDS.length - 1));
    } finally {
      transitionPending.current = false;
      setIsAdvancing(false);
    }
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
        if (compact && result.fieldErrors) {
          const first = Object.keys(result.fieldErrors).find(
            (name) => compactStepForField(name) >= 0,
          );
          if (first) {
            const targetStep = compactStepForField(first);
            if (targetStep !== compactStep) {
              pendingFocusField.current = first as CompactField;
              setCompactStep(targetStep);
            } else {
              const field = first as CompactField;
              form.setFocus(field === "modelId" && otherBrand ? "modelOther" : field);
            }
          }
        }
        if (!result.fieldErrors) toast.error(result.message || DATABASE_ERROR_MESSAGE);
        return;
      }
      track("generate_lead", {
        vehicle_type: data.vehicleType,
        usage: data.usage,
        request_number: result.requestNumber,
      });
      setConfirmedVehicleType(data.vehicleType);
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
    transitionPending.current = false;
    setCompactStep(0);
    returningToForm.current = true;
    setSubmitted(false);
  };

  if (submitted && requestNumber && submittedLeadId && submittedWhatsappUrl) {
    return (
      <LeadConfirmation
        vehicleType={confirmedVehicleType}
        leadId={submittedLeadId}
        requestNumber={requestNumber}
        whatsappUrl={submittedWhatsappUrl}
        onNewQuote={startAnotherQuote}
      />
    );
  }

  return (
    <form
      className={compact ? "lead-form lead-form--compact" : "lead-form"}
      onChangeCapture={() => {
        if (started.current) return;
        started.current = true;
        track("form_start", { vehicle_type: form.getValues("vehicleType") });
      }}
      noValidate
      aria-label="Formulario de cotización"
      onSubmit={(event) => {
        if (compact && compactStep < COMPACT_STAGE_FIELDS.length - 1) {
          event.preventDefault();
          void advanceCompactStep();
          return;
        }
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
              compact
                ? ([
                    "fullName",
                    "phone",
                    "email",
                    "dni",
                    "vehicleType",
                    "plate",
                    "year",
                    "brandId",
                    "brandOther",
                    "modelId",
                    "modelOther",
                    "hasGnc",
                    "postalCode",
                    "usage",
                    "consent",
                  ] as const)
                : ([
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
                  ] as const)
            ).find((name) => errors[name]);
            if (first && compact) {
              const targetStep = compactStepForField(first);
              if (targetStep >= 0 && targetStep !== compactStep) {
                pendingFocusField.current = first as CompactField;
                setCompactStep(targetStep);
              } else {
                form.setFocus(first === "modelId" && otherBrand ? "modelOther" : first);
              }
            } else if (first) {
              form.setFocus(first === "modelId" && otherBrand ? "modelOther" : first);
            }
            submitPending.current = false;
          })(event)
          .catch(() => {
            submitPending.current = false;
            toast.error(DATABASE_ERROR_MESSAGE);
          });
      }}
    >
      <p className="form-intro">
        {compact
          ? COMPACT_STAGE_DESCRIPTIONS[compactStep]
          : "Completá tus datos y los de tu vehículo. La patente no es obligatoria si tu vehículo es 0 km."}
      </p>
      {compact && (
        <>
          <ol className="quote-progress" aria-label="Etapas de la cotización">
            {COMPACT_STAGE_LABELS.map((label, index) => (
              <li
                key={label}
                aria-current={compactStep === index ? "step" : undefined}
                data-complete={index < compactStep || undefined}
              >
                <span className="quote-progress__marker" aria-hidden="true">
                  {index < compactStep ? <Check size={12} /> : index + 1}
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            Paso {compactStep + 1} de {COMPACT_STAGE_LABELS.length}:{" "}
            {COMPACT_STAGE_LABELS[compactStep]}
          </p>
        </>
      )}
      <FieldGroup className="quote-form-fields">
        <fieldset
          className="quote-form-fieldset quote-form-fieldset--vehicle-choice"
          hidden={compact && compactStep !== 1}
        >
          <legend className={compact ? "sr-only" : undefined}>Vehículo</legend>
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
        </fieldset>
        <fieldset
          ref={compactStep === 0 ? stageFieldsetRef : undefined}
          className="quote-form-fieldset quote-form-fieldset--contact"
          hidden={compact && compactStep !== 0}
          tabIndex={compact && compactStep === 0 ? -1 : undefined}
        >
          <legend className={compact ? "sr-only" : undefined}>Tus datos</legend>
          {text("fullName", "Nombre y apellido", { autoComplete: "name", maxLength: 100 })}
          {text(
            "phone",
            "Teléfono",
            { type: "tel", inputMode: "tel", autoComplete: "tel" },
            compact
              ? "Código de área, sin 0 ni 15. Ej.: 341 4123456."
              : "Incluí el código de área, sin 0 ni 15. Por ejemplo: 341 4123456.",
          )}
          {text("email", "Email", { type: "email", autoComplete: "email", autoCapitalize: "none" })}
          {compact && text("dni", "DNI", { inputMode: "numeric" })}
        </fieldset>
        {compact && compactStep === 0 && (
          <div className="quote-stage-actions">
            <Button
              type="button"
              className="quote-button w-full"
              disabled={isAdvancing}
              onClick={() => void advanceCompactStep()}
            >
              {isAdvancing ? "Validando…" : "Continuar a tu vehículo"}
            </Button>
          </div>
        )}
        <fieldset
          ref={compactStep === 1 ? stageFieldsetRef : undefined}
          className="quote-form-fieldset quote-form-fieldset--vehicle-details"
          hidden={compact && compactStep !== 1}
          tabIndex={compact && compactStep === 1 ? -1 : undefined}
        >
          <legend className={compact ? "sr-only" : undefined}>Datos del vehículo</legend>
          <Controller
            name="isZeroKm"
            control={form.control}
            render={({ field }) => (
              <Field className={compact ? "quote-zero-km" : undefined}>
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
            compact
              ? isZeroKm
                ? "No es obligatoria para un 0 km."
                : vehicleType === "AUTO"
                  ? "AAA123 o AA123BB."
                  : "123ABC o A123BCD."
              : vehicleType === "AUTO"
                ? "Por ejemplo: AAA123 o AA123BB."
                : "Por ejemplo: 123ABC o A123BCD.",
          )}
          {compact &&
            text(
              "year",
              "Año del vehículo",
              { inputMode: "numeric" },
              `${MIN_YEAR} a ${new Date().getFullYear() + 1}.`,
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
              <Field
                data-invalid={fieldState.invalid}
                className={compact && otherBrand ? "quote-field-wide" : undefined}
              >
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
          {otherBrand &&
            text("brandOther", "Otra marca", { maxLength: 40 }, undefined, "quote-field-wide")}
          {otherBrand ? (
            text("modelOther", "Modelo", { maxLength: 60 }, undefined, "quote-field-wide")
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
                            ? compact
                              ? "Elegí primero la marca."
                              : "Primero seleccioná una marca."
                            : compact
                              ? "También podés elegir Otro."
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
              {otherModel &&
                text("modelOther", "Otro modelo", { maxLength: 60 }, undefined, "quote-field-wide")}
            </>
          )}
          {!compact &&
            text(
              "year",
              "Año del vehículo",
              { inputMode: "numeric" },
              `Entre ${MIN_YEAR} y ${new Date().getFullYear() + 1}.`,
            )}
        </fieldset>
        <fieldset
          ref={compactStep === 2 ? stageFieldsetRef : undefined}
          className="quote-form-fieldset quote-form-fieldset--usage"
          hidden={compact && compactStep !== 2}
          tabIndex={compact && compactStep === 2 ? -1 : undefined}
        >
          {compact && <legend className="sr-only">Uso y envío</legend>}
          {!compact && <legend className="sr-only">Uso del vehículo</legend>}
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
                      field.onChange(
                        event.target.value === "" ? null : event.target.value === "true",
                      )
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
            compact ? "4 dígitos o CPA." : "4 dígitos o CPA, por ejemplo S2000ABC.",
            vehicleType === "MOTO" ? "quote-field-wide" : undefined,
          )}
          <Controller
            name="usage"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className={compact ? "quote-field-wide" : undefined}
              >
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
        </fieldset>
        {compact && compactStep === 1 && (
          <div className="quote-stage-actions">
            <Button
              type="button"
              variant="outline"
              disabled={isAdvancing}
              aria-label="Volver a tus datos"
              onClick={() => setCompactStep(0)}
            >
              <ArrowLeft aria-hidden="true" size={16} />
              Volver
            </Button>
            <Button
              type="button"
              className="quote-button"
              disabled={isAdvancing}
              aria-label="Continuar a uso y envío"
              onClick={() => void advanceCompactStep()}
            >
              {isAdvancing ? "Validando…" : "Continuar"}
              <ArrowRight aria-hidden="true" size={16} />
            </Button>
          </div>
        )}
        {!compact && text("dni", "DNI", { inputMode: "numeric" })}
        <fieldset
          className="quote-form-fieldset quote-form-fieldset--submission"
          hidden={compact && compactStep !== 2}
        >
          <legend className="sr-only">Consentimiento y envío</legend>
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
          {(!compact || compactStep === 2) && (
            <TurnstileWidget
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              whatsappUrl={whatsappUrl}
              resetKey={turnstileResetKey}
              onTokenChange={(token) => {
                setTurnstileToken(token);
                if (token) setTurnstileError(null);
              }}
            />
          )}
          {turnstileError && (
            <p className="text-sm text-destructive" aria-live="polite">
              {turnstileError}
            </p>
          )}
          <div className={compact ? "quote-stage-actions quote-stage-actions--final" : undefined}>
            {compact && (
              <Button
                type="button"
                variant="outline"
                aria-label="Volver al vehículo"
                onClick={() => setCompactStep(1)}
              >
                <ArrowLeft aria-hidden="true" size={16} />
                Volver
              </Button>
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
          </div>
          <p className="form-demo-note" role="status">
            Al enviar, vamos a registrar tu solicitud para que un asesor pueda contactarte.
          </p>
        </fieldset>
      </FieldGroup>
    </form>
  );
}
