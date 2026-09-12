import { Children, Fragment, cloneElement, isValidElement } from "react";
import wordmark from "@/content/site/brand-wordmark.json";
export function Brand({ accent = false }: { accent?: boolean }) {
  return <span className={`inline-brand${accent ? " brand-accent" : ""}`}><span className="sr-only">RVA3D</span><svg className="brand-wordmark" viewBox={wordmark.viewBox} preserveAspectRatio="xMinYMid meet" aria-hidden="true" focusable="false"><g className="brand-rva"><path d={wordmark.rvaPath} /></g><g className="brand-three-d"><path className="brand-three-glyph" d={wordmark.threePath} /><path className="brand-d-glyph" d={wordmark.dPath} /></g></svg></span>;
}

/* Previous hybrid markup retained for restoration. It mixed live Geist text with a
   separate suffix SVG, so browser font metrics could shift the approved relationship.
   return <span className={`inline-brand${accent ? " brand-accent" : ""}`}><span className="sr-only">RVA3D</span><span className="brand-rva" aria-hidden="true"><span className="brand-r">R</span>VA</span><svg className="brand-three-d" viewBox={suffix.viewBox} aria-hidden="true" focusable="false"><path className="brand-three-glyph" d={suffix.threePath} /><path className="brand-d-glyph" d={suffix.dPath} transform={`translate(${suffix.dShift} 0)`} /></svg></span>;
*/

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
