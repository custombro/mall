import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const landing = readFileSync(new URL("../app/_components/SalesLanding.tsx", import.meta.url), "utf8");
const slugs = ["acrylic-keyring", "cosmetic-display", "exhibition-display"];

test("public product pages offer semantic FAQ and internal related-product navigation", () => {
  assert.match(landing, /<details key=\{question\}/);
  assert.match(landing, /<nav aria-label="관련 아크릴 상품"/);
  for (const slug of slugs) {
    const page = readFileSync(new URL(`../app/${slug}/page.tsx`, import.meta.url), "utf8");
    assert.match(page, /faqs=\{\[/);
    assert.match(page, /relatedLinks=\{\[/);
    assert.match(page, /alternates: \{ canonical: `https:\/\/mall\.custombro\.org\/${slug}` \}/.replace("${slug}",slug));
    assert.match(page, /primaryHref=\{STUDIO_LINKS\.(keyring|display)\}/);
  }
});

test("related links stay inside existing public landing routes", () => {
  for (const slug of slugs) {
    const page = readFileSync(new URL(`../app/${slug}/page.tsx`, import.meta.url), "utf8");
    const links = [...page.matchAll(/href: "(\/[^"]+)"/g)].map(x => x[1]);
    assert.equal(links.length, 2);
    for (const link of links) assert.ok(slugs.some(other => link === `/${other}`));
  }
});
