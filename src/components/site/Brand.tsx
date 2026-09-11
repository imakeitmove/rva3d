import { Children, Fragment, cloneElement, isValidElement } from "react";
import suffix from "@/content/site/brand-suffix.json";
export function Brand({ accent = false }: { accent?: boolean }) {
  return <span className={`inline-brand${accent ? " brand-accent" : ""}`}><span className="sr-only">RVA3D</span><span className="brand-rva" aria-hidden="true"><span className="brand-r">R</span>VA</span><svg className="brand-three-d" viewBox={suffix.viewBox} aria-hidden="true" focusable="false"><path className="brand-three-glyph" d={suffix.threePath} /><path className="brand-d-glyph" d={suffix.dPath} transform={`translate(${suffix.dShift} 0)`} /></svg></span>;
}

// Previously RVA was a single text run; the R span allows variant-specific optical spacing.
// The original combined suffix path remains in brand-suffix.json for restoration; split
// glyph paths let reference 003's slightly more open 3/D spacing scale at every use size.

/** Only authored React copy is transformed: never attributes, HTML, URLs or DOM. */
export function BrandText({ text }: { text: string }) {
  return <>{text.split(/(?<![\w@./])(RVA3D)(?![\w./])/g).map((part, index) =>
    part === "RVA3D" ? <Brand key={index} /> : part)}</>;
}
function brandCopyNodes(children: import("react").ReactNode): import("react").ReactNode {
  return Children.map(children, child => {
    if (typeof child === "string") return <BrandText text={child} />;
    if (!isValidElement<{ children?: import("react").ReactNode; className?: string; "aria-hidden"?: boolean | "true" | "false"; "data-brand-copy"?: string }>(child)) return child;
    // Custom components own their copy. Existing marks and accessible names stay plain.
    if (typeof child.type !== "string" && child.type !== Fragment) return child;
    if (typeof child.type === "string" && /^(svg|script|style|code|pre|input|textarea|option)$/.test(child.type)) return child;
    // FAQ disclosure labels keep one consistent question typeface. The exception
    // stops at the summary, so expanded answer copy still receives branded marks.
    if (child.type === "summary" && child.props["data-brand-copy"] === "plain") return child;
    if (child.props["aria-hidden"] === true || child.props["aria-hidden"] === "true" ||
      /(?:^|\s)(?:inline-brand|sr-only)(?:\s|$)/.test(child.props.className || "")) return child;
    return cloneElement(child, {}, brandCopyNodes(child.props.children));
  });
}
export function BrandCopy({ children }: { children: import("react").ReactNode }) {
  return <>{brandCopyNodes(children)}</>;
}
