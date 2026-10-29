import { ImageResponse } from "next/og";
import { landingContent } from "@/content/landing";
import { SEO_BRAND_PHRASE, SEO_OG_IMAGE, SEO_OG_IMAGE_ALT } from "@/content/seo";

export const alt = SEO_OG_IMAGE_ALT;
export const size = { width: SEO_OG_IMAGE.width, height: SEO_OG_IMAGE.height };
export const contentType = "image/png";

const NAVY = "#101725";
const NAVY_SOFT = "#192232";
const CORAL = "#ff795f";
const CREAM = "#f7f8fc";
const MUTED = "#b7c0d4";

/** Imagen Open Graph [PROVISORIO]: se reemplaza cuando la marca esté confirmada. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 62%, #1d2a3f 100%)`,
        color: CREAM,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            width: 60,
            height: 60,
            marginRight: 22,
            borderRadius: 18,
            background: CORAL,
          }}
        />
        <div style={{ display: "flex", fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em" }}>
          {landingContent.brandSegments[0]}
          <span style={{ color: CORAL }}>{landingContent.brandSegments[1]}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 82, fontWeight: 800, letterSpacing: "-0.035em" }}>
          {SEO_BRAND_PHRASE}
        </div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 34, color: MUTED }}>
          {landingContent.footer.description}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{ display: "flex", width: 96, height: 6, marginRight: 24, background: CORAL }}
        />
        <div style={{ display: "flex", fontSize: 26, color: MUTED }}>
          Asesoramiento personalizado por WhatsApp
        </div>
      </div>
    </div>,
    { ...size },
  );
}
