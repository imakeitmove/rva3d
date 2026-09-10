import { notFound, redirect } from "next/navigation";
import { getCapabilityBySlug } from "@/content/capabilities";
import proofData from "@/content/site/capability-proof-v2.generated.json";
import type { WorkMedia } from "@/content/work/types";
import { siteHref } from "@/lib/site/paths";
import { Shell } from "./Shell";
import { SiteMedia } from "./SiteMedia";
import { CapabilityPlayer } from "./CapabilityPlayer";
import "./editorial-refinement.css";
export async function CapabilityDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const capability = getCapabilityBySlug(slug);
  if (!capability) notFound();
  if (slug !== "vfx-compositing") redirect(siteHref(`/capabilities#${slug}`));
  const proof = proofData.bud as WorkMedia;
  return <Shell><section className="editorial-opening" data-tone="paper"><div className="v-frame"><a className="editorial-link" href={siteHref("/capabilities#vfx-compositing")}>← All capabilities</a><p className="label">04 / VFX and Compositing</p><h1>When the shot needs<br />more than the <em>shoot.</em></h1><p className="editorial-lead">Create a moment the camera could never capture. Extend what production captured. Or make a necessary change disappear into the finished image.</p></div></section>
    <section className="v-broad visual-chapter" data-tone="paper"><div className="chapter-text"><p className="label">The photographed world</p><h2>A believable image is a chain of matched decisions.</h2><p>Camera, perspective, movement, light, reflections and texture all need to agree. For Bud Light Seltzer, the truck-side wrap was replaced across several live-action shots. The existing breakdown shows the original shot alongside the finished result.</p><a className="editorial-link" href={siteHref("/capabilities#vfx-compositing")}>Back to capability proof ↗</a></div>{/* Previous conventional proof player retained: <SiteMedia media={protectedMedia(cable.processChapters[3].media[0])} /> */}<div className="capabilities-editorial">{proof.kind === "video" ? <CapabilityPlayer media={proof} /> : <SiteMedia media={proof} />}</div></section>
    <section className="v-frame vfx-depth" data-tone="paper"><div className="vfx-pair">{capability.proof.map(proof => <article key={proof.title}><p className="label">{proof.label}</p><h2>{proof.title}</h2><p>{proof.summary}</p></article>)}</div><h2>Solve the shot before polishing the shot.</h2><div className="vfx-steps">{[
      ["Plan the handoff", "Identify what needs to be captured, supplied, tracked, rebuilt or protected before production choices become expensive."],
      ["Match the photographed world", "Develop camera, perspective, movement, lighting, reflections, texture and timing as one integration problem."],
      ["Build what the shot needs", "Use controllable CG and compositing methods that serve the frame and keep revisions practical."],
      ["Finish for delivery", "Review the result in motion, preserve the intended focus and adapt approved work to the required formats."],
    ].map(([title, text], i) => <article key={title}><p className="label">0{i + 1}</p><h3>{title}</h3><p>{text}</p></article>)}</div><h2>From one critical fix to a complete sequence.</h2><ul className="deliverable-list">{["Integrated final shots", "Screen, sign and graphic replacement", "CG and live-action compositing", "Tracked 3D elements", "Cleanup and removal", "Environmental extensions", "Effects animation", "Alternate branded and campaign formats"].map(item => <li key={item}>{item}</li>)}</ul><p>RVA3D can join during planning, step into an existing production or solve a focused post problem after the camera has wrapped.</p><a className="button" href={siteHref("/#contact")}>Talk through the shot ↗</a></section></Shell>;
}

// V1 deeper-page proof retained for restoration.
// import { notFound, redirect } from "next/navigation";
// import { getCapabilityBySlug } from "@/content/capabilities";
// import { studies, protectedMedia } from "@/lib/site/content";
// import { siteHref } from "@/lib/site/paths";
// import { Shell } from "./Shell";
// import { SiteMedia } from "./SiteMedia";
// import { CapabilityPlayer } from "./CapabilityPlayer";
// import "./editorial-refinement.css";
// export async function CapabilityDetail({ params }: { params: Promise<{ slug: string }> }) {
//   const { slug } = await params;
//   const capability = getCapabilityBySlug(slug);
//   if (!capability) notFound();
//   if (slug !== "vfx-compositing") redirect(siteHref(`/capabilities#${slug}`));
//   const cable = studies.find(item => item.slug === "cable-snake")!;
//   const proof = protectedMedia(cable.processChapters[3].media[0]);
//   return <Shell><section className="editorial-opening" data-tone="paper"><div className="v-frame"><a className="editorial-link" href={siteHref("/capabilities#vfx-compositing")}>← All capabilities</a><p className="label">04 / VFX and Compositing</p><h1>When the shot needs<br />more than the <em>shoot.</em></h1><p className="editorial-lead">Create a moment the camera could never capture. Extend what production captured. Or make a necessary change disappear into the finished image.</p></div></section>
//     <section className="v-broad visual-chapter" data-tone="paper"><div className="chapter-text"><p className="label">The photographed world</p><h2>A believable image is a chain of matched decisions.</h2><p>Camera, perspective, movement, light, reflections and texture all need to agree. For Cable Snake, the CG character had to remain consistent with its practical counterpart while supporting new poses, timing and performance.</p><a className="editorial-link" href={siteHref("/work/cable-snake")}>See the Cable Snake story ↗</a></div>{/* Previous conventional proof player retained: <SiteMedia media={protectedMedia(cable.processChapters[3].media[0])} /> */}<div className="capabilities-editorial">{proof.kind === "video" ? <CapabilityPlayer media={proof} /> : <SiteMedia media={proof} />}</div></section>
//     <section className="v-frame vfx-depth" data-tone="paper"><div className="vfx-pair">{capability.proof.map(proof => <article key={proof.title}><p className="label">{proof.label}</p><h2>{proof.title}</h2><p>{proof.summary}</p></article>)}</div><h2>Solve the shot before polishing the shot.</h2><div className="vfx-steps">{[
//       ["Plan the handoff", "Identify what needs to be captured, supplied, tracked, rebuilt or protected before production choices become expensive."],
//       ["Match the photographed world", "Develop camera, perspective, movement, lighting, reflections, texture and timing as one integration problem."],
//       ["Build what the shot needs", "Use controllable CG and compositing methods that serve the frame and keep revisions practical."],
//       ["Finish for delivery", "Review the result in motion, preserve the intended focus and adapt approved work to the required formats."],
//     ].map(([title, text], i) => <article key={title}><p className="label">0{i + 1}</p><h3>{title}</h3><p>{text}</p></article>)}</div><h2>From one critical fix to a complete sequence.</h2><ul className="deliverable-list">{["Integrated final shots", "Screen, sign and graphic replacement", "CG and live-action compositing", "Tracked 3D elements", "Cleanup and removal", "Environmental extensions", "Effects animation", "Alternate branded and campaign formats"].map(item => <li key={item}>{item}</li>)}</ul><p>RVA3D can join during planning, step into an existing production or solve a focused post problem after the camera has wrapped.</p><a className="button" href={siteHref("/#contact")}>Talk through the shot ↗</a></section></Shell>;
// }
//
