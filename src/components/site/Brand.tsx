import suffix from "@/content/site/brand-suffix.json";
export function Brand({ accent = false }: { accent?: boolean }) {
  return <span className={`inline-brand${accent ? " brand-accent" : ""}`}><span className="sr-only">RVA3D</span><span className="brand-rva" aria-hidden="true">RVA</span><svg className="brand-three-d" viewBox={suffix.viewBox} aria-hidden="true" focusable="false"><path d={suffix.path} /></svg></span>;
}
