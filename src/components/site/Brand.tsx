import { Children, Fragment, cloneElement, isValidElement } from "react";
import suffix from "@/content/site/brand-suffix.json";
export function Brand({ accent = false }: { accent?: boolean }) {
  return <span className={`inline-brand${accent ? " brand-accent" : ""}`}><span className="sr-only">RVA3D</span><span className="brand-rva" aria-hidden="true"><span className="brand-r">R</span>VA</span><svg className="brand-three-d" viewBox={suffix.viewBox} aria-hidden="true" focusable="false"><path d={suffix.path} /></svg></span>;
}

// Previously RVA was a single text run; the R span allows variant-specific optical spacing.

/** Only authored React copy is transformed: never attributes, HTML, URLs or DOM. */
export function BrandText({ text }: { text: string }) {
  return <>{text.split(/(?<![\w@./])(RVA3D)(?![\w./])/g).map((part, index) =>
    part === "RVA3D" ? <Brand key={index} /> : part)}</>;
}
function brandCopyNodes(children: import("react").ReactNode): import("react").ReactNode {
  return Children.map(children, child => {
    if (typeof child === "string") return <BrandText text={child} />;
    if (!isValidElement<{ children?: import("react").ReactNode; className?: string; "aria-hidden"?: boolean | "true" | "false" }>(child)) return child;
    // Custom components own their copy. Existing marks and accessible names stay plain.
    if (typeof child.type !== "string" && child.type !== Fragment) return child;
    if (typeof child.type === "string" && /^(svg|script|style|code|pre|input|textarea|option)$/.test(child.type)) return child;
    if (child.props["aria-hidden"] === true || child.props["aria-hidden"] === "true" ||
      /(?:^|\s)(?:inline-brand|sr-only)(?:\s|$)/.test(child.props.className || "")) return child;
    return cloneElement(child, {}, brandCopyNodes(child.props.children));
  });
}
export function BrandCopy({ children }: { children: import("react").ReactNode }) {
  return <>{brandCopyNodes(children)}</>;
}
