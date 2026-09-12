import "./editorial-refinement.css";
import { capabilities } from "@/content/capabilities";
import { capabilityEditorial } from "@/content/site/capability-editorial";
import proofData from "@/content/site/capability-proof-v2.generated.json";
import type { WorkMedia, WorkVideoMedia } from "@/content/work/types";
import { mediaUrl, studies, protectedMedia } from "@/lib/site/content";
import { siteHref } from "@/lib/site/paths";
import { Shell } from "./Shell";
import { SiteMedia } from "./SiteMedia";
import { CapabilityPlayer } from "./CapabilityPlayer";
import { InteractiveLogo } from "./InteractiveLogo";

const proof = proofData as unknown as Record<string, WorkMedia>;
export function CapabilityEditorial() {
  const amsoil = studies.find(item => item.slug === "amsoil-xpd-wind-grease")!;
  // Previous WHAXE hero selection is retained in the V1 implementation below;
  // the active proof slot now uses the requested Five Below display animation.
  const hero = protectedMedia(amsoil.heroMedia);
  const heroSrc = hero.kind === "image" ? hero.src : hero.poster.src;
  // One authoritative registry reference can replace the motion reel without changing layout.
  const reel = capabilities.find(item => item.slug === "motion-design")!.overviewMedia!;
  const motion = protectedMedia({ kind: "video", presentation: "controls", src: reel.src, width: reel.width, height: reel.height, mimeType: "video/mp4", alt: reel.alt, poster: { kind: "image", ...("poster" in reel ? reel.poster : { src: "", width: 1280, height: 720 }), alt: reel.alt } } as WorkVideoMedia);
  const fiveBelow = protectedMedia({ kind: "video", presentation: "loop", src: "/media/capabilities/five-below-zig-zag-display-loop.mp4", width: 1280, height: 720, mimeType: "video/mp4", alt: "Five Below zig-zag retail display animation", poster: { kind: "image", src: "/media/capabilities/five-below-zig-zag-display-poster.webp", width: 1280, height: 720, alt: "Five Below zig-zag retail display" } } as WorkVideoMedia);
  const desmi = protectedMedia({ kind: "video", presentation: "loop", src: "/media/capabilities/desmi-rotan-chd-sizzle-loop.mp4", width: 1280, height: 720, mimeType: "video/mp4", alt: "DESMI ROTAN CHD pump cutaway, exploded assembly and rotor animation", poster: { kind: "image", src: "/media/capabilities/desmi-rotan-chd-sizzle-poster.webp", width: 1280, height: 720, alt: "DESMI ROTAN CHD blue pump with its internal rotor visible" } } as WorkVideoMedia);
  const selected: Record<string, WorkMedia> = { "3d-animation": fiveBelow, "product-technical-visualization": desmi, "motion-design": motion, "vfx-compositing": proof.bud, "creative-production-support": proof.production };
  const logoModelUrl = mediaUrl("/models/RVA_Logo_010_intro_002.glb");
  return <Shell><div className="capabilities-editorial capabilities-v2">
    <section className="capability-ambient-hero" data-tone="void"><div className="ambient-capability-image" style={{ backgroundImage: `url("${heroSrc}")` }} aria-hidden="true" /><div className="editorial-width ambient-hero-grid"><div><p className="label">Capabilities / What we do</p><h1>We make the pixels<br className="wide-only" /> do what we<br className="wide-only" /> <em>want them to do.</em></h1><p>Take the idea from talk to tech. RVA3D has the tools and techniques to tell the story, show how a product works or build something people can interact with. Tell us what you need people to see.</p><a className="button" href={siteHref("/#contact")}>Get in touch <span aria-hidden="true">&#8599;</span></a></div><figure><SiteMedia capabilityFullscreen media={hero} priority /><figcaption>Inside the work / AMSOIL technical visualization</figcaption></figure></div></section>
    <div className="editorial-width capability-wayfinding" data-tone="paper"><nav aria-label="Jump to a capability">{capabilities.map(capability => <a key={capability.slug} href={`#${capability.slug}`}>{capability.title}</a>)}</nav></div>
    <div className="refined-capabilities">{capabilities.map(capability => {
      const copy = capabilityEditorial[capability.slug];
      // Previous composition put the heading above both columns and the logo on the left.
      if (capability.slug === "interactive-3d") return <section className="interactive-also" id={capability.slug} key={capability.slug} data-tone="paper"><div className="editorial-width interactive-proof-grid"><div className="capability-section-heading"><p className="label">Also / Interactive Media &amp; Prototyping</p><h2>{copy.promise}</h2></div><InteractiveLogo modelUrl={logoModelUrl} /><div className="interactive-copy"><p>{copy.copy}</p><a className="proof-link" href={siteHref("/interactive")}>Explore this site&#8217;s interactive gallery <span aria-hidden="true">&#8599;</span></a><p className="studio-note">Self-initiated RVA3D work.</p></div></div></section>;
      const media = selected[capability.slug];
      return <section className={`refined-capability refined-${capability.slug}`} key={capability.slug} id={capability.slug} data-tone={capability.slug === "product-technical-visualization" ? "void" : "paper"}><div className="editorial-width"><div className="capability-proof-grid"><div className="capability-section-heading"><p className="label">{capability.title}</p><h2>{copy.promise}</h2></div><div className="large-capability-proof">{media.kind === "video" ? <CapabilityPlayer media={media} /> : <SiteMedia capabilityFullscreen media={media} />}</div><div className="capability-commission">{copy.copy.split("\n\n").map(paragraph => <p key={paragraph}>{paragraph}</p>)}<ul className="need-labels" aria-label="Good for">{copy.uses.map(need => <li key={need}>{need}</li>)}</ul><div className="capability-proof-note">{copy.proof && <p>{copy.proof}</p>}
        {/* Previous AXE story link and Wawa player destination were unrelated to the Five Below proof. */}
        {capability.slug === "product-technical-visualization" && <><div className="capability-story-actions" role="group" aria-label="Technical visualization stories"><a className="proof-link" href={siteHref("/work/amsoil-xpd-wind-grease")}>See the AMSOIL story <span aria-hidden="true">&#8599;</span></a><a className="proof-link" href={siteHref("/work/desmi-rotan-pump")}>See the DESMI story <span aria-hidden="true">&#8599;</span></a></div><a className="proof-link supporting-proof" href={siteHref("/work/wawa-coffee-island")}>From fixture CAD to a stocked Wawa Coffee Island <span aria-hidden="true">&#8599;</span></a></>}
        {capability.slug === "motion-design" && <a className="proof-link" href={siteHref("/work")}>Explore selected work <span aria-hidden="true">&#8599;</span></a>}
        {capability.slug === "vfx-compositing" && <><a className="proof-link" href={siteHref("/capabilities/vfx-compositing")}>A closer look at VFX &amp; compositing <span aria-hidden="true">&#8599;</span></a><details className="vfx-microcase"><summary>Virginia Lottery / A quieter replacement</summary><div className="microcase-pair"><figure><SiteMedia capabilityFullscreen media={proof.lotteryBefore} /><figcaption>Original</figcaption></figure><figure><SiteMedia capabilityFullscreen media={proof.lotteryAfter} /><figcaption>Finished sign</figcaption></figure></div><p>A sign changes while the photographed scene stays familiar.</p></details></>}
        {capability.slug === "creative-production-support" && <a className="proof-link" href={siteHref("/about#how-we-work")}>See how the work happens <span aria-hidden="true">&#8599;</span></a>}
      </div></div></div></div></section>;
    })}</div>
    <section className="messy-brief" data-tone="paper"><div className="editorial-width messy-grid"><div>{/* Previous reassurance: A good place to start / Bring the messy version. */}<p className="label">WE ARE ON YOUR TEAM</p><h2>We&#8217;ll help you<br /><em>however we can.</em></h2></div><div><p>A finished brief is welcome, but not required. Bring the script, sketch, CAD file, reference folder, footage or half-formed idea.</p><p>We&#8217;ll work out what needs making, what to review when and the clearest path to final.</p><div className="messy-actions"><a className="button" href={siteHref("/#contact")}>Get in touch <span aria-hidden="true">&#8599;</span></a><a className="proof-link" href={siteHref("/about#how-we-work")}>See how we work <span aria-hidden="true">&#8599;</span></a></div></div></div></section>
  </div></Shell>;
}


// Before this pass the commission rendered a single <p>{copy.copy}</p>.
// The AMSOIL/DESMI links were ungrouped, with DESMI using supporting-proof's block style.
// V1 implementation retained for restoration; superseded by the V2 proof-led composition.
// import "./editorial-refinement.css";
// // Image rendering remains delegated to the shared SiteMedia component.
// import { capabilities } from "@/content/capabilities";
// import { capabilityEditorial } from "@/content/site/capability-editorial";
// import { studies, protectedMedia } from "@/lib/site/content";
// import { siteHref } from "@/lib/site/paths";
// import { Shell } from "./Shell";
// import { SiteMedia } from "./SiteMedia";
// import { StudioExplorer } from "./StudioExplorer";
// import { CapabilityPlayer, CapabilityMotionToggle } from "./CapabilityPlayer";
// 
// const caseSlugs: Record<string, string> = { "3d-animation": "cable-snake", "product-technical-visualization": "amsoil-xpd-wind-grease", "motion-design": "axe-whaxe-lil-baby", "vfx-compositing": "cable-snake", "creative-production-support": "capri-sun" };
// export function CapabilityEditorial() {
//   const hero = protectedMedia(studies.find(item => item.slug === "amsoil-xpd-wind-grease")!.heroMedia);
//   const heroSrc = hero.kind === "image" ? hero.src : hero.poster.src;
//   return <Shell><div className="capabilities-editorial">
//     <section className="capability-ambient-hero" data-tone="void"><div className="ambient-capability-image" style={{ backgroundImage: `url("${heroSrc}")` }} aria-hidden="true" /><div className="editorial-width ambient-hero-grid"><div><p className="label">Capabilities / What we do</p><h1>We make the pixels<br className="wide-only" /> do what we<br className="wide-only" /> <em>want them to do.</em></h1><p>Take the idea from talk to tech. RVA3D has the tools and techniques to tell the story, show how a product works or build something people can interact with. Tell us what you need people to see.</p><a className="button" href={siteHref("/#contact")}>Get in touch <span aria-hidden="true">↗</span></a></div><figure><SiteMedia media={hero} priority /><figcaption>Inside the work / AMSOIL technical visualization</figcaption></figure></div></section>
//     <div className="editorial-width capability-wayfinding" data-tone="paper"><nav aria-label="Jump to a capability">{capabilities.map(capability => <a key={capability.slug} href={`#${capability.slug}`}>{capability.title}<span aria-hidden="true">↗</span></a>)}</nav><CapabilityMotionToggle /></div>
//     <div className="refined-capabilities">{capabilities.map(capability => {
//       const copy = capabilityEditorial[capability.slug];
//       const study = studies.find(item => item.slug === caseSlugs[capability.slug]);
//       const selected = study && (capability.slug === "3d-animation" ? study.galleryMedia.find(item => item.kind === "video") || study.processChapters[1].media[2] : capability.slug === "product-technical-visualization" ? study.processChapters[2].media[0] : capability.slug === "motion-design" ? study.processChapters[1].media[0] : capability.slug === "vfx-compositing" ? study.processChapters[3].media[0] : study.heroMedia);
//       const media = selected && protectedMedia(selected);
//       return <section className={`refined-capability refined-${capability.slug}`} key={capability.slug} id={capability.slug} data-tone={capability.slug === "product-technical-visualization" ? "void" : "paper"}><div className="editorial-width"><div className="capability-section-heading"><p className="label">{capability.title}</p><h2>{copy.promise}</h2></div><div className="capability-proof-grid"><div className="large-capability-proof">{media ? media.kind === "video" ? <CapabilityPlayer media={media} /> : <SiteMedia media={media} /> : <StudioExplorer />}</div><div className="capability-commission"><p>{copy.copy}</p><ul className="need-labels" aria-label="Use it for">{copy.uses.map(need => <li key={need}>{need}</li>)}</ul><div className="capability-proof-note"><p className="label">{study ? "The proof" : "Self-initiated studio study"}</p><p>{copy.proof}</p>{study && <a className="proof-link" href={siteHref(`/work/${study.slug}`)}>See the {study.slug === "axe-whaxe-lil-baby" ? "AXE WHAXE" : study.slug === "capri-sun" ? "Capri Sun" : study.slug === "cable-snake" ? "Cable Snake" : "AMSOIL"} story <span aria-hidden="true">↗</span></a>}{capability.slug === "product-technical-visualization" && <a className="proof-link supporting-proof" href={siteHref("/work/wawa-coffee-island")}>Or see fixture CAD become a stocked Wawa Coffee Island <span aria-hidden="true">↗</span></a>}{capability.slug === "vfx-compositing" && <a className="proof-link supporting-proof" href={siteHref("/capabilities/vfx-compositing")}>A closer look at VFX &amp; compositing <span aria-hidden="true">↗</span></a>}</div></div></div></div></section>;
//     })}</div>
//     <section className="messy-brief" data-tone="paper"><div className="editorial-width messy-grid"><div><p className="label">A good place to start</p><h2>Bring the<br /><em>messy version.</em></h2></div><div><p>A finished brief is welcome, but not required. Bring the script, sketch, CAD file, reference folder, footage or half-formed “can we somehow…” idea.</p><p>We’ll work out what needs making, what to review when, what to lock early and the clearest path to final.</p><div className="messy-actions"><a className="button" href={siteHref("/#contact")}>Get in touch <span aria-hidden="true">↗</span></a><a className="proof-link" href={siteHref("/about#how-we-work")}>See how we work <span aria-hidden="true">↗</span></a></div></div></div></section>
//   </div></Shell>;
// }
// 
