import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TurnstileWidget } from "./turnstile-widget";

type RenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
  "response-field": false;
  size: "flexible" | "compact";
};

const state = vi.hoisted(() => ({
  render: vi.fn(),
  reset: vi.fn(),
  remove: vi.fn(),
  options: null as RenderOptions | null,
}));

beforeEach(() => {
  vi.useFakeTimers();
  state.render.mockImplementation((_container: HTMLElement, options: RenderOptions) => {
    state.options = options;
    return "widget-id";
  });
  state.reset.mockClear();
  state.remove.mockClear();
  state.render.mockClear();
  document.getElementById("cf-turnstile-script")?.remove();
  delete (window as Window & { turnstile?: unknown }).turnstile;
});

function installTurnstileApi() {
  Object.defineProperty(window, "turnstile", {
    configurable: true,
    value: { render: state.render, reset: state.reset, remove: state.remove },
  });
}

afterEach(() => {
  cleanup();
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  delete (window as Window & { turnstile?: unknown }).turnstile;
});

describe("TurnstileWidget", () => {
  it("shows the configured WhatsApp fallback after script load failure", async () => {
    render(
      <TurnstileWidget
        siteKey="site-key"
        whatsappUrl="https://wa.me/5493415550000"
        onTokenChange={vi.fn()}
      />,
    );
    await act(async () => {
      fireEvent.error(document.getElementById("cf-turnstile-script")!);
      await Promise.resolve();
    });
    expect(screen.getByText(/no pudimos cargar la verificación/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /escribinos por whatsapp/i })).toHaveAttribute(
      "href",
      "https://wa.me/5493415550000",
    );
  });

  it("renders explicitly without a native response field and clears expired tokens", async () => {
    const onTokenChange = vi.fn();
    render(<TurnstileWidget siteKey="site-key" onTokenChange={onTokenChange} />);
    const script = document.getElementById("cf-turnstile-script");
    expect(script).toHaveAttribute(
      "src",
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
    );
    installTurnstileApi();
    await act(async () => {
      fireEvent.load(script!);
      await Promise.resolve();
    });
    expect(state.render).toHaveBeenCalledOnce();
    expect(state.options).toMatchObject({
      sitekey: "site-key",
      "response-field": false,
      size: "flexible",
    });
    state.options?.callback("fresh-token");
    expect(onTokenChange).toHaveBeenLastCalledWith("fresh-token");
    state.options?.["expired-callback"]();
    expect(onTokenChange).toHaveBeenLastCalledWith(null);
  });

  it("resets a consumed widget and removes it on unmount", async () => {
    installTurnstileApi();
    const { rerender, unmount } = render(
      <TurnstileWidget siteKey="site-key" onTokenChange={vi.fn()} resetKey={0} />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(state.render).toHaveBeenCalledOnce();
    rerender(<TurnstileWidget siteKey="site-key" onTokenChange={vi.fn()} resetKey={1} />);
    expect(state.reset).toHaveBeenCalledWith("widget-id");
    unmount();
    expect(state.remove).toHaveBeenCalledWith("widget-id");
  });

  it("fails closed when configuration is absent", () => {
    render(<TurnstileWidget onTokenChange={vi.fn()} />);
    expect(screen.getByText(/verificación todavía no está configurada/i)).toBeInTheDocument();
    expect(screen.getByText("WhatsApp todavía no está configurado.")).toBeInTheDocument();
    expect(document.getElementById("cf-turnstile-script")).not.toBeInTheDocument();
  });

  it("fails closed after the bounded script-loading timeout", async () => {
    render(<TurnstileWidget siteKey="site-key" onTokenChange={vi.fn()} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(screen.getByText(/no pudimos cargar la verificación/i)).toBeInTheDocument();
  });
  it("can load again on remount after a timed-out script", async () => {
    const first = render(<TurnstileWidget siteKey="site-key" onTokenChange={vi.fn()} />);
    const firstScript = document.getElementById("cf-turnstile-script");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    first.unmount();
    render(<TurnstileWidget siteKey="site-key" onTokenChange={vi.fn()} />);
    const script = document.getElementById("cf-turnstile-script");
    expect(script).toBeInTheDocument();
    expect(script).not.toBe(firstScript);
    installTurnstileApi();
    await act(async () => {
      fireEvent.load(script!);
      await Promise.resolve();
    });
    expect(state.render).toHaveBeenCalledOnce();
    expect(screen.queryByText(/no pudimos cargar la verificación/i)).not.toBeInTheDocument();
  });
});
