import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LeadNoteList } from "./lead-note-list";

afterEach(cleanup);

function note(overrides: Partial<Parameters<typeof LeadNoteList>[0]["notes"][number]> = {}) {
  return {
    id: "note-1",
    body: "Cotizó todo riesgo",
    authorEmail: "asesor@miseguro.test",
    createdAt: new Date("2026-10-28T12:30:00Z"),
    ...overrides,
  };
}

describe("LeadNoteList", () => {
  it("muestra el email del autor y la fecha en hora de Argentina", () => {
    render(<LeadNoteList notes={[note()]} />);

    expect(screen.getByText(/asesor@miseguro\.test/)).toBeInTheDocument();
    // 12:30 UTC son las 09:30 en Argentina.
    expect(screen.getByText(/28\/10\/2026/)).toBeInTheDocument();
  });

  it("respeta el orden recibido, con la más vieja arriba", () => {
    render(
      <LeadNoteList
        notes={[note({ id: "a", body: "Primera nota" }), note({ id: "b", body: "Segunda nota" })]}
      />,
    );

    const bodies = screen.getAllByText(/Primera nota|Segunda nota/).map((node) => node.textContent);
    expect(bodies).toEqual(["Primera nota", "Segunda nota"]);
  });

  it("muestra las etiquetas HTML como texto literal", () => {
    const { container } = render(
      <LeadNoteList notes={[note({ body: "<script>alert(1)</script> y <b>negrita</b>" })]} />,
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
    expect(screen.getByText("<script>alert(1)</script> y <b>negrita</b>")).toBeInTheDocument();
  });

  it("conserva los saltos de línea con whitespace-pre-wrap y corta palabras largas", () => {
    render(<LeadNoteList notes={[note({ body: "Primera línea\nSegunda línea" })]} />);

    const body = screen.getByText(/Primera línea/);
    expect(body).toHaveClass("whitespace-pre-wrap");
    expect(body).toHaveClass("break-words");
    expect(body.textContent).toBe("Primera línea\nSegunda línea");
  });

  it("avisa cuando el lead todavía no tiene notas", () => {
    render(<LeadNoteList notes={[]} />);

    expect(screen.getByText("Todavía no hay notas en este lead.")).toBeInTheDocument();
  });
});
