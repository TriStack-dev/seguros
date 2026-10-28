import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "./json-ld";

describe("JsonLd", () => {
  it("renders a JSON-LD script in the server HTML", () => {
    const html = renderToStaticMarkup(
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Thing", name: "MiSeguro" }} />,
    );

    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain('"@type":"Thing"');
  });

  it("escapes markup so a value cannot close the script tag", () => {
    const html = renderToStaticMarkup(
      <JsonLd data={{ name: "</script><script>alert(1)</script>" }} />,
    );

    expect(html).not.toContain("</script><script>");
    expect(html).toContain("\\u003c/script>");
  });
});
