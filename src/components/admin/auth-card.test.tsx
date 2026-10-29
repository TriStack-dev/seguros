import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, it } from "vitest";
import { AuthCard } from "./auth-card";

afterEach(cleanup);

it("applies the shared accessible auth surface to every account screen", () => {
  render(
    <AuthCard title="Recuperá tu contraseña">
      <label htmlFor="email">Email</label>
      <input id="email" />
    </AuthCard>,
  );
  expect(screen.getByRole("main").closest(".admin-auth")).not.toBeNull();
  expect(screen.getByRole("heading", { name: "Recuperá tu contraseña", level: 1 })).toBeVisible();
  expect(screen.getByRole("textbox", { name: "Email" })).toBeVisible();
});
