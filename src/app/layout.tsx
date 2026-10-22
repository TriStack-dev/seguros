import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "MiSeguro",
  description: "Cotizá el seguro de tu auto o tu moto y te contacta un asesor por WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
