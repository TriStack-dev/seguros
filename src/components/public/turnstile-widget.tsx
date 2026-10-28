"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
  "response-field": false;
  size: "flexible" | "compact";
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type Props = {
  siteKey?: string;
  whatsappUrl?: string;
  resetKey?: number;
  onTokenChange: (token: string | null) => void;
};

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const LOAD_TIMEOUT_MS = 10_000;
let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
    }

    const timer = window.setTimeout(() => {
      detach();
      reject(new Error("Turnstile script timed out"));
    }, LOAD_TIMEOUT_MS);
    const detach = () => {
      window.clearTimeout(timer);
      script?.removeEventListener("load", loaded);
      script?.removeEventListener("error", failed);
    };
    const loaded = () => {
      detach();
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile API unavailable"));
    };
    const failed = () => {
      detach();
      reject(new Error("Turnstile script failed"));
    };
    script.addEventListener("load", loaded, { once: true });
    script.addEventListener("error", failed, { once: true });
    if (!script.isConnected) document.head.append(script);
  })
    .then((api) => {
      scriptPromise = null;
      return api;
    })
    .catch((error: unknown) => {
      scriptPromise = null;
      document.getElementById(SCRIPT_ID)?.remove();
      throw error;
    });

  return scriptPromise;
}

function FailureMessage({ whatsappUrl }: { whatsappUrl?: string }) {
  return (
    <div className="space-y-1 text-sm text-destructive" aria-live="polite">
      <p>No pudimos cargar la verificación. Probá de nuevo más tarde.</p>
      {whatsappUrl ? (
        <a className="underline underline-offset-4" href={whatsappUrl}>
          Escribinos por WhatsApp
        </a>
      ) : (
        <p>WhatsApp todavía no está configurado.</p>
      )}
    </div>
  );
}

export function TurnstileWidget({ siteKey, whatsappUrl, resetKey = 0, onTokenChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onTokenChange);
  const previousResetKeyRef = useRef(resetKey);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    siteKey ? "loading" : "failed",
  );

  useEffect(() => {
    callbackRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      callbackRef.current(null);
      setStatus("failed");
      return;
    }

    let active = true;
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      if (!active) return;
      callbackRef.current(null);
      setStatus("failed");
    }, LOAD_TIMEOUT_MS);

    void loadTurnstile()
      .then((api) => {
        window.clearTimeout(timer);
        if (!active || timedOut || !containerRef.current) return;
        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: siteKey,
          "response-field": false,
          size: window.matchMedia?.("(max-width: 480px)").matches ? "compact" : "flexible",
          callback: (token) => {
            if (!active) return;
            callbackRef.current(token);
            setStatus("ready");
          },
          "error-callback": () => {
            callbackRef.current(null);
            setStatus("failed");
          },
          "expired-callback": () => callbackRef.current(null),
          "timeout-callback": () => {
            callbackRef.current(null);
            setStatus("failed");
          },
        });
        setStatus("ready");
      })
      .catch(() => {
        window.clearTimeout(timer);
        if (!active) return;
        callbackRef.current(null);
        setStatus("failed");
      });

    return () => {
      active = false;
      window.clearTimeout(timer);
      callbackRef.current(null);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (previousResetKeyRef.current === resetKey) return;
    previousResetKeyRef.current = resetKey;
    callbackRef.current(null);
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetKey]);

  return (
    <div className="space-y-2" aria-label="Verificación de seguridad">
      {siteKey ? (
        <div ref={containerRef} className="min-h-16" />
      ) : (
        <div className="space-y-1 text-sm text-destructive" aria-live="polite">
          <p>
            La verificación todavía no está configurada. No podemos recibir la solicitud en este
            momento.
          </p>
          {whatsappUrl ? (
            <a className="underline underline-offset-4" href={whatsappUrl}>
              Escribinos por WhatsApp
            </a>
          ) : (
            <p>WhatsApp todavía no está configurado.</p>
          )}
        </div>
      )}
      {status === "failed" && siteKey && <FailureMessage whatsappUrl={whatsappUrl} />}
      {status === "loading" && siteKey && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Cargando verificación de seguridad…
        </p>
      )}
    </div>
  );
}
