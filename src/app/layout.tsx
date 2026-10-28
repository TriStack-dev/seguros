import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { buildSiteMetadata } from "@/lib/seo";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = buildSiteMetadata();

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={cn("font-sans", geist.variable)}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
