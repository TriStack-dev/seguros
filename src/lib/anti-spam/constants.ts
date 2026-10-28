// [PROVISORIO] Reglas de negocio, sección 11.
export const SUBMISSIONS_PER_HOUR = 5;
export const ATTEMPT_WINDOW_MS = 60 * 60 * 1000;
export const ATTEMPT_RETENTION_MS = 7 * 24 * ATTEMPT_WINDOW_MS;
export const CLEANUP_PROBABILITY = 0.01;
export const RATE_LIMIT_MESSAGE =
  "Recibimos varias solicitudes desde tu conexión. Probá de nuevo más tarde o escribinos por WhatsApp.";
export const TURNSTILE_ERROR_MESSAGE =
  "No pudimos verificar que sos una persona. Reintentá la verificación o escribinos por WhatsApp.";
